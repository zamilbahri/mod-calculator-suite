import type { RsaEncodingMode } from '../../../types';
import { modPow } from '../core';
import { parseBigIntStrict } from '../validation';
import {
  bigIntToBytes,
  bytesToBigInt,
  getModulusByteLength,
  isAsciiOnly,
  type AlphabetEncoding,
} from './encoding';

export interface ResolveRsaBlockSizeOptions {
  blockSizeInput: string;
  encodingMode: RsaEncodingMode;
  defaultBlockSize: number;
}

export interface EncryptRsaMessageOptions {
  message: string;
  e: bigint;
  n: bigint;
  encodingMode: RsaEncodingMode;
  blockSize: number;
  encoding: AlphabetEncoding;
}

export interface DecryptRsaMessageOptions {
  ciphertext: string;
  d: bigint;
  n: bigint;
  encodingMode: RsaEncodingMode;
  blockSize: number;
  encoding: AlphabetEncoding;
}

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
