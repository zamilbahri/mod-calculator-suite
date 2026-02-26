/**
 * RSA encryption/decryption helpers for multiple text encodings.
 *
 * Supports packed-radix, fixed-width numeric, and PKCS#1 v1.5 text flows.
 */
import type { RsaCiphertextFormat, RsaEncodingMode } from '../../../types';
import { modPow } from '../core';
import { parseBigIntStrict } from '../validation';
import {
  bigIntToBytes,
  bytesToBigInt,
  getModulusByteLength,
  isAsciiOnly,
  type AlphabetEncoding,
} from './encoding';

/**
 * Options for resolving effective RSA block size from UI inputs.
 *
 * @interface ResolveRsaBlockSizeOptions
 * @property {string} blockSizeInput - Raw user input for block size.
 * @property {RsaEncodingMode} encodingMode - Selected encoding mode.
 * @property {number} defaultBlockSize - Derived default block size.
 */
export interface ResolveRsaBlockSizeOptions {
  blockSizeInput: string;
  encodingMode: RsaEncodingMode;
  defaultBlockSize: number;
}

/**
 * Inputs required to encrypt RSA plaintext.
 *
 * @interface EncryptRsaMessageOptions
 * @property {string} message - Plaintext message.
 * @property {bigint} e - Public exponent.
 * @property {bigint} n - RSA modulus.
 * @property {RsaEncodingMode} encodingMode - Text encoding mode.
 * @property {number} blockSize - Symbols (or digits) per block.
 * @property {AlphabetEncoding} encoding - Alphabet mapping.
 */
export interface EncryptRsaMessageOptions {
  message: string;
  e: bigint;
  n: bigint;
  encodingMode: RsaEncodingMode;
  blockSize: number;
  encoding: AlphabetEncoding;
}

/**
 * Inputs required to decrypt RSA ciphertext.
 *
 * @interface DecryptRsaMessageOptions
 * @property {string} ciphertext - Decimal ciphertext blocks separated by whitespace.
 * @property {bigint} d - Private exponent.
 * @property {bigint} n - RSA modulus.
 * @property {RsaEncodingMode} encodingMode - Text encoding mode.
 * @property {number} blockSize - Symbols (or digits) per block.
 * @property {AlphabetEncoding} encoding - Alphabet mapping.
 */
export interface DecryptRsaMessageOptions {
  ciphertext: string;
  d: bigint;
  n: bigint;
  encodingMode: RsaEncodingMode;
  blockSize: number;
  encoding: AlphabetEncoding;
}

/**
 * Encodes bytes to Base64 using browser or Node runtime APIs.
 *
 * @param {Uint8Array} bytes - Bytes to encode.
 * @returns {string} Base64 string.
 * @throws {Error} If no Base64 runtime helper is available.
 */
const bytesToBase64 = (bytes: Uint8Array): string => {
  if (typeof btoa === 'function') {
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  }

  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }

  throw new Error('Base64 conversion is not available in this environment.');
};

/**
 * Decodes Base64/Base64URL text to bytes.
 *
 * @param {string} value - Base64-like input.
 * @returns {Uint8Array} Decoded bytes.
 * @throws {Error} If no Base64 runtime helper is available.
 */
const base64ToBytes = (value: string): Uint8Array => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const remainder = normalized.length % 4;
  const padded =
    remainder === 0 ? normalized : `${normalized}${'='.repeat(4 - remainder)}`;

  if (typeof atob === 'function') {
    const binary = atob(padded);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      out[i] = binary.charCodeAt(i);
    }
    return out;
  }

  if (typeof Buffer !== 'undefined') {
    const buffer = Buffer.from(padded, 'base64');
    return new Uint8Array(buffer);
  }

  throw new Error('Base64 conversion is not available in this environment.');
};

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (byte) =>
    byte.toString(16).toUpperCase().padStart(2, '0'),
  ).join(' ');

const hexToBytes = (hex: string): Uint8Array => {
  if (hex === '') {
    throw new Error('Empty hex ciphertext block.');
  }
  if (hex.length % 2 !== 0) {
    throw new Error('Hex ciphertext block must contain an even number of digits.');
  }

  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    const pair = hex.slice(i * 2, i * 2 + 2);
    const parsed = Number.parseInt(pair, 16);
    if (Number.isNaN(parsed)) {
      throw new Error('Hex ciphertext block contains invalid characters.');
    }
    out[i] = parsed;
  }
  return out;
};

const normalizeHexToken = (value: string): string =>
  value.replace(/^0x/i, '').replace(/[^0-9a-fA-F]/g, '');

/**
 * Formats decimal ciphertext blocks into selected external format.
 *
 * @param {readonly string[]} blocks - Decimal ciphertext blocks.
 * @param {RsaCiphertextFormat} format - Target output format.
 * @returns {string} Serialized ciphertext.
 *
 * @example
 * formatCiphertextBlocks(['12345', '999'], 'hex')
 */
export const formatCiphertextBlocks = (
  blocks: readonly string[],
  format: RsaCiphertextFormat,
): string => {
  if (format === 'decimal') return blocks.join(' ');

  const encodedBlocks = blocks.map((block, index) => {
    const value = parseBigIntStrict(block, `ciphertext block ${index + 1}`);
    if (format === 'hex') return bytesToHex(bigIntToBytes(value));
    return bytesToBase64(bigIntToBytes(value));
  });
  return format === 'hex' ? encodedBlocks.join('\n') : encodedBlocks.join(' ');
};

/**
 * Parses formatted ciphertext input into whitespace-separated decimal blocks.
 *
 * Accepts:
 * - decimal blocks (`"123 456"`)
 * - hex lines/tokens (`"0A FF"` or one block per line)
 * - Base64/Base64URL tokens
 *
 * @param {string} ciphertext - Raw ciphertext input.
 * @param {RsaCiphertextFormat} format - Input format.
 * @returns {string} Decimal block string for internal RSA math.
 * @throws {Error} If token parsing fails.
 *
 * @example
 * parseCiphertextInputToDecimal('0A FF', 'hex')
 */
export const parseCiphertextInputToDecimal = (
  ciphertext: string,
  format: RsaCiphertextFormat,
): string => {
  if (format === 'decimal') return ciphertext;

  const trimmed = ciphertext.trim();
  if (trimmed === '') return '';

  if (format === 'hex') {
    const lines = trimmed
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line !== '');

    let hexBlocks: string[];
    if (lines.length > 1) {
      hexBlocks = lines.map((line) => normalizeHexToken(line));
    } else {
      const tokens = trimmed.split(/\s+/).filter((token) => token !== '');
      if (tokens.length === 1) {
        hexBlocks = [normalizeHexToken(tokens[0])];
      } else if (tokens.every((token) => /^(?:0x)?[0-9a-fA-F]{2}$/.test(token))) {
        hexBlocks = [tokens.map((token) => token.replace(/^0x/i, '')).join('')];
      } else {
        hexBlocks = tokens.map((token) => normalizeHexToken(token));
      }
    }

    const decimalBlocks = hexBlocks.map((hexBlock, index) => {
      try {
        const bytes = hexToBytes(hexBlock);
        return bytesToBigInt(bytes).toString();
      } catch (cause) {
        const message =
          cause instanceof Error ? cause.message : 'Invalid hex token.';
        throw new Error(`Invalid hex ciphertext block ${index + 1}: ${message}`);
      }
    });

    return decimalBlocks.join(' ');
  }

  const tokens = trimmed.split(/\s+/);
  const decimalBlocks = tokens.map((token, index) => {
    try {
      const bytes = base64ToBytes(token);
      if (bytes.length === 0) {
        throw new Error('Empty Base64 ciphertext block.');
      }
      return bytesToBigInt(bytes).toString();
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : 'Invalid Base64 token.';
      throw new Error(`Invalid Base64 ciphertext block ${index + 1}: ${message}`);
    }
  });

  return decimalBlocks.join(' ');
};

/**
 * Resolves effective block size from input and mode defaults.
 *
 * In fixed-width mode, blank input defaults to `defaultBlockSize * 2`
 * because each symbol consumes two digits.
 *
 * @param {ResolveRsaBlockSizeOptions} options - Block size options.
 * @returns {number} Positive integer block size.
 * @throws {Error} If parsed block size is not a positive integer.
 */
export const resolveRsaBlockSize = ({
  blockSizeInput,
  encodingMode,
  defaultBlockSize,
}: ResolveRsaBlockSizeOptions): number => {
  const blockSize =
    blockSizeInput.trim() === ''
      ? encodingMode === 'fixed-width-numeric'
        ? defaultBlockSize * 2
        : defaultBlockSize
      : Number.parseInt(blockSizeInput, 10);

  if (!Number.isInteger(blockSize) || blockSize < 1) {
    throw new Error('Block size must be a positive integer.');
  }

  return blockSize;
};

/**
 * Fills an array with non-zero random bytes for PKCS#1 v1.5 PS.
 *
 * @param {Uint8Array} bytes - Padding bytes to populate.
 */
const fillNonZeroRandomBytes = (bytes: Uint8Array) => {
  crypto.getRandomValues(bytes);
  for (let i = 0; i < bytes.length; i += 1) {
    while (bytes[i] === 0) {
      const refill = new Uint8Array(1);
      crypto.getRandomValues(refill);
      bytes[i] = refill[0];
    }
  }
};

/**
 * Decodes a PKCS#1 v1.5 encoded message block.
 *
 * @param {bigint} message - Decrypted message integer.
 * @param {bigint} n - RSA modulus.
 * @returns {string} Decoded UTF-8 plaintext.
 * @throws {Error} If block structure or padding is invalid.
 */
const decodePkcs1V15Message = (message: bigint, n: bigint): string => {
  const k = getModulusByteLength(n);
  let em = bigIntToBytes(message);
  if (em.length > k) {
    throw new Error('Invalid PKCS#1 block length.');
  }
  if (em.length < k) {
    const padded = new Uint8Array(k);
    padded.set(em, k - em.length);
    em = padded;
  }
  if (em[0] !== 0x00 || em[1] !== 0x02) {
    throw new Error('Invalid PKCS#1 v1.5 block header.');
  }
  let sep = -1;
  for (let j = 2; j < em.length; j += 1) {
    if (em[j] === 0x00) {
      sep = j;
      break;
    }
  }
  if (sep < 0) throw new Error('Invalid PKCS#1 v1.5 block: missing separator.');
  const psLen = sep - 2;
  if (psLen < 8) {
    throw new Error('Invalid PKCS#1 v1.5 block: padding too short.');
  }
  for (let j = 2; j < sep; j += 1) {
    if (em[j] === 0x00) {
      throw new Error('Invalid PKCS#1 v1.5 block: padding contains zero byte.');
    }
  }
  return new TextDecoder().decode(em.slice(sep + 1));
};

/**
 * Encrypts plaintext message into decimal RSA ciphertext blocks.
 *
 * @param {EncryptRsaMessageOptions} options - Encryption options.
 * @returns {string[]} Decimal ciphertext blocks.
 * @throws {Error} For invalid alphabet data, invalid key constraints, or block-size violations.
 *
 * @example
 * encryptRsaMessage({
 *   message: 'HELLO',
 *   e: 65537n,
 *   n: 999630013489n,
 *   encodingMode: 'radix',
 *   blockSize: 2,
 *   encoding,
 * })
 */
export const encryptRsaMessage = ({
  message,
  e,
  n,
  encodingMode,
  blockSize,
  encoding,
}: EncryptRsaMessageOptions): string[] => {
  if (!isAsciiOnly(message)) {
    throw new Error('Text to encrypt must contain ASCII characters only.');
  }
  if (e <= 1n || n <= 1n) {
    throw new Error('e and n must both be greater than 1.');
  }
  if (e >= n) {
    throw new Error('e must be smaller than n.');
  }

  const blocks: string[] = [];
  const modulusDigits = n.toString().length;

  if (encodingMode === 'pkcs1-v1_5') {
    const messageBytes = new TextEncoder().encode(message);
    const k = getModulusByteLength(n);
    const padLength = k - 3 - messageBytes.length;
    if (padLength < 8) {
      throw new Error('Message too long for PKCS#1 v1.5 with this modulus.');
    }

    const em = new Uint8Array(k);
    em[0] = 0x00;
    em[1] = 0x02;
    const ps = new Uint8Array(padLength);
    fillNonZeroRandomBytes(ps);
    em.set(ps, 2);
    em[2 + padLength] = 0x00;
    em.set(messageBytes, 3 + padLength);

    const m = bytesToBigInt(em);
    if (m >= n) {
      throw new Error('PKCS#1 encoded message is >= n. Use a larger modulus.');
    }
    blocks.push(modPow(m, e, n).toString());
    return blocks;
  }

  const symbols: bigint[] = [];
  for (const rawChar of message) {
    if (encodingMode === 'fixed-width-numeric' && /\s/.test(rawChar)) continue;
    const ch = encoding.normalizeChar(rawChar);
    const symbol = encoding.charToValue.get(ch);
    if (symbol === undefined) {
      throw new Error(
        `Character "${rawChar}" is not present in the selected alphabet.`,
      );
    }
    symbols.push(symbol);
  }

  if (encodingMode === 'fixed-width-numeric') {
    if (blockSize % 2 !== 0) {
      throw new Error('Fixed-width numeric slicing block size must be even.');
    }

    const xSymbol = encoding.charToValue.get(encoding.normalizeChar('X'));
    if (xSymbol === undefined) {
      throw new Error(
        'Alphabet must contain "X" for Fixed-width numeric slicing padding.',
      );
    }
    if (xSymbol < 0n || xSymbol > 99n) {
      throw new Error(
        'Fixed-width numeric slicing requires symbol values in [0, 99].',
      );
    }

    const numericStream = symbols
      .map((s) => {
        if (s < 0n || s > 99n) {
          throw new Error(
            'Fixed-width numeric slicing requires symbol values in [0, 99].',
          );
        }
        return s.toString().padStart(2, '0');
      })
      .join('');
    const padSymbolDigits = xSymbol.toString().padStart(2, '0');

    let i = 0;
    while (i < numericStream.length) {
      let digitChunk = numericStream.slice(i, i + blockSize);
      i += blockSize;
      while (digitChunk.length < blockSize) digitChunk += padSymbolDigits;
      const m = BigInt(digitChunk);
      if (m >= n) {
        throw new Error('A plaintext block is >= n. Reduce block size or increase n.');
      }
      const c = modPow(m, e, n).toString().padStart(modulusDigits, '0');
      blocks.push(c);
    }
    return blocks;
  }

  for (let i = 0; i < symbols.length; i += blockSize) {
    const chunk = symbols.slice(i, i + blockSize);
    let m = 0n;
    for (const symbol of chunk) {
      m = m * encoding.radix + symbol;
    }
    if (m >= n) {
      throw new Error('A plaintext block is >= n. Reduce block size or increase n.');
    }
    blocks.push(modPow(m, e, n).toString());
  }
  return blocks;
};

/**
 * Decrypts decimal RSA ciphertext blocks into plaintext.
 *
 * @param {DecryptRsaMessageOptions} options - Decryption options.
 * @returns {string} Decoded plaintext.
 * @throws {Error} If ciphertext is malformed or symbol decoding fails.
 */
export const decryptRsaMessage = ({
  ciphertext,
  d,
  n,
  encodingMode,
  blockSize,
  encoding,
}: DecryptRsaMessageOptions): string => {
  if (ciphertext.trim() === '') {
    throw new Error('Encrypted text cannot be empty.');
  }

  const tokens = ciphertext.trim().split(/\s+/);
  let text = '';

  for (let i = 0; i < tokens.length; i += 1) {
    const c = parseBigIntStrict(tokens[i], 'ciphertext block');
    const m = modPow(c, d, n);

    if (encodingMode === 'pkcs1-v1_5') {
      if (tokens.length !== 1) {
        throw new Error('PKCS#1 v1.5 mode expects exactly one ciphertext block.');
      }
      text = decodePkcs1V15Message(m, n);
      break;
    }

    const decoded: string[] = [];
    if (encodingMode === 'fixed-width-numeric') {
      if (blockSize % 2 !== 0) {
        throw new Error('Fixed-width numeric slicing block size must be even.');
      }
      const digits = m.toString().padStart(blockSize, '0');
      for (let j = 0; j < digits.length; j += 2) {
        const symbol = BigInt(digits.slice(j, j + 2));
        const ch = encoding.valueToChar.get(symbol);
        if (ch === undefined) {
          throw new Error(
            'Cannot map decrypted symbol back to the selected alphabet.',
          );
        }
        decoded.push(ch);
      }
    } else {
      let value = m;
      while (value > 0n) {
        const symbol = value % encoding.radix;
        value /= encoding.radix;
        const ch = encoding.valueToChar.get(symbol);
        if (ch === undefined) {
          throw new Error(
            'Cannot map decrypted symbol back to the selected alphabet.',
          );
        }
        decoded.push(ch);
      }
      decoded.reverse();
      if (i !== tokens.length - 1) {
        while (decoded.length < blockSize) {
          const ch = encoding.valueToChar.get(0n);
          if (ch === undefined) break;
          decoded.unshift(ch);
        }
      }
    }

    text += decoded.join('');
  }

  return text;
};
