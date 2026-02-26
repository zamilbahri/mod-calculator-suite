/**
 * RSA text encoding helpers.
 *
 * Provides alphabet mapping, radix helpers, and bigint/byte conversion utilities
 * used by RSA encrypt/decrypt flows.
 */
import type { RsaAlphabetMode } from '../../../types';
import { parseBigIntStrict } from '../validation';

/** Default custom alphabet used by UI presets. */
export const DEFAULT_CUSTOM_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Bidirectional symbol encoding definition for RSA text packing.
 *
 * @typedef {object} AlphabetEncoding
 * @property {bigint} radix - Numeric base used when packing symbols into blocks.
 * @property {(ch: string) => string} normalizeChar - Character normalization function.
 * @property {Map<string, bigint>} charToValue - Character to numeric symbol map.
 * @property {Map<bigint, string>} valueToChar - Numeric symbol to character map.
 */
export type AlphabetEncoding = {
  radix: bigint;
  normalizeChar: (ch: string) => string;
  charToValue: Map<string, bigint>;
  valueToChar: Map<bigint, string>;
};

/**
 * Options for building a custom or ASCII alphabet encoding.
 *
 * @interface BuildAlphabetEncodingOptions
 * @property {RsaAlphabetMode} alphabetMode - Encoding mode (`ascii` or custom).
 * @property {string} customAlphabet - Custom alphabet source string.
 * @property {boolean} customIgnoreCase - Whether custom matching is case-insensitive.
 * @property {string} customOffset - Starting numeric offset for the first symbol.
 */
export interface BuildAlphabetEncodingOptions {
  alphabetMode: RsaAlphabetMode;
  customAlphabet: string;
  customIgnoreCase: boolean;
  customOffset: string;
}

/**
 * Checks whether a string is ASCII-only.
 *
 * @param {string} value - Input string.
 * @returns {boolean} `true` when all code points are in `[0, 127]`.
 */
export const isAsciiOnly = (value: string): boolean => {
  for (let i = 0; i < value.length; i += 1) {
    if (value.charCodeAt(i) > 127) return false;
  }
  return true;
};

/**
 * Builds alphabet encoding tables for RSA text modes.
 *
 * @param {BuildAlphabetEncodingOptions} options - Encoding construction options.
 * @returns {AlphabetEncoding} Bidirectional alphabet mapping.
 * @throws {Error} If custom alphabet is empty, non-ASCII, or contains duplicates.
 *
 * @example
 * buildAlphabetEncoding({
 *   alphabetMode: 'custom',
 *   customAlphabet: 'ABCXYZ',
 *   customIgnoreCase: true,
 *   customOffset: '0',
 * })
 */
export const buildAlphabetEncoding = ({
  alphabetMode,
  customAlphabet,
  customIgnoreCase,
  customOffset,
}: BuildAlphabetEncodingOptions): AlphabetEncoding => {
  const charToValue = new Map<string, bigint>();
  const valueToChar = new Map<bigint, string>();

  if (alphabetMode === 'ascii') {
    for (let i = 0; i < 128; i += 1) {
      const ch = String.fromCharCode(i);
      const v = BigInt(i);
      charToValue.set(ch, v);
      valueToChar.set(v, ch);
    }
    return {
      radix: 128n,
      normalizeChar: (ch: string) => ch,
      charToValue,
      valueToChar,
    };
  }

  if (customAlphabet === '')
    throw new Error('Custom alphabet cannot be empty.');
  if (!isAsciiOnly(customAlphabet)) {
    throw new Error('Custom alphabet must use ASCII characters only.');
  }

  const offset = parseBigIntStrict(
    customOffset.trim() === '' ? '0' : customOffset,
    'alphabet offset',
  );
  const source = customIgnoreCase
    ? customAlphabet.toUpperCase()
    : customAlphabet;

  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (charToValue.has(ch)) {
      throw new Error('Custom alphabet cannot contain duplicate characters.');
    }
    const value = offset + BigInt(i);
    charToValue.set(ch, value);
    valueToChar.set(value, ch);
  }

  return {
    radix: offset + BigInt(source.length),
    normalizeChar: (ch: string) => (customIgnoreCase ? ch.toUpperCase() : ch),
    charToValue,
    valueToChar,
  };
};

/**
 * Computes the largest block length `k` such that `radix^k <= n`.
 *
 * @param {bigint} n - RSA modulus.
 * @param {bigint} radix - Encoding radix.
 * @returns {number} Safe default symbol block size.
 */
export const getDefaultBlockSize = (n: bigint, radix: bigint): number => {
  if (n <= 1n || radix <= 1n) return 1;
  let k = 1;
  let value = radix;
  while (value * radix <= n) {
    value *= radix;
    k += 1;
  }
  return k;
};

/**
 * Returns modulus byte length for PKCS-style block sizing.
 *
 * @param {bigint} n - RSA modulus.
 * @returns {number} Byte length of `n`.
 */
export const getModulusByteLength = (n: bigint): number =>
  Math.max(1, Math.ceil(n.toString(2).length / 8));

/**
 * Converts a non-negative bigint to big-endian bytes.
 *
 * @param {bigint} value - Value to encode.
 * @returns {Uint8Array} Big-endian byte representation.
 */
export const bigIntToBytes = (value: bigint): Uint8Array => {
  if (value === 0n) return new Uint8Array([0]);
  let hex = value.toString(16);
  if (hex.length % 2 === 1) hex = `0${hex}`;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
};

/**
 * Converts big-endian bytes to bigint.
 *
 * @param {Uint8Array} bytes - Big-endian byte array.
 * @returns {bigint} Decoded bigint value.
 */
export const bytesToBigInt = (bytes: Uint8Array): bigint => {
  let acc = 0n;
  for (const b of bytes) acc = (acc << 8n) + BigInt(b);
  return acc;
};
