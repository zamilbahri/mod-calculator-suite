/**
 * Random bigint helpers for probabilistic number-theory algorithms.
 *
 * Randomness prefers `crypto.getRandomValues` and falls back to `Math.random`
 * only when Web Crypto is unavailable.
 */
import { MathValidationError } from './validation';

/**
 * Computes the binary bit length of a bigint.
 *
 * @param {bigint} n - Value to measure.
 * @returns {number} Number of bits in the absolute binary representation.
 */
export function bitLength(n: bigint): number {
  return n.toString(2).length;
}

/**
 * Produces random bytes, preferring cryptographically secure randomness.
 *
 * @param {number} length - Number of bytes requested.
 * @returns {Uint8Array} Random byte array of the requested length.
 */
function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  const cryptoObj = globalThis.crypto;
  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    cryptoObj.getRandomValues(bytes);
    return bytes;
  }
  for (let i = 0; i < length; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
}

/**
 * Samples uniformly from `[0, upperExclusive)`.
 *
 * Uses rejection sampling to avoid modulo bias.
 *
 * @param {bigint} upperExclusive - Exclusive upper bound (must be positive).
 * @returns {bigint} Uniform random bigint below the upper bound.
 * @throws {MathValidationError} If `upperExclusive <= 0`.
 */
export function randomBigIntBelowAny(upperExclusive: bigint): bigint {
  if (upperExclusive <= 0n) {
    throw new MathValidationError('upperExclusive', 'must be positive.');
  }
  if (upperExclusive === 1n) return 0n;

  const max = upperExclusive - 1n;
  const bits = bitLength(max);
  const bytesLen = Math.ceil(bits / 8);
  const excessBits = bytesLen * 8 - bits;
  const topMask = 0xff >> excessBits;

  while (true) {
    const bytes = randomBytes(bytesLen);
    bytes[0] &= topMask;

    let value = 0n;
    for (const byte of bytes) {
      value = (value << 8n) | BigInt(byte);
    }
    if (value < upperExclusive) return value;
  }
}

/**
 * Samples uniformly from `[0, upperExclusive)` for Miller-Rabin base selection.
 *
 * @param {bigint} upperExclusive - Exclusive upper bound (must be greater than 2).
 * @returns {bigint} Uniform random bigint below the upper bound.
 * @throws {MathValidationError} If `upperExclusive <= 2`.
 */
export function randomBigIntBelow(upperExclusive: bigint): bigint {
  if (upperExclusive <= 2n) {
    throw new MathValidationError('n', 'must be greater than', '3');
  }
  return randomBigIntBelowAny(upperExclusive);
}

/**
 * Samples uniformly from an inclusive range.
 *
 * @param {bigint} minInclusive - Inclusive lower bound.
 * @param {bigint} maxInclusive - Inclusive upper bound.
 * @returns {bigint} Uniform random bigint in `[minInclusive, maxInclusive]`.
 * @throws {MathValidationError} If `maxInclusive < minInclusive`.
 */
export function randomBigIntInRange(
  minInclusive: bigint,
  maxInclusive: bigint,
): bigint {
  if (maxInclusive < minInclusive) {
    throw new MathValidationError('range', 'is invalid.');
  }
  const width = maxInclusive - minInclusive + 1n;
  return minInclusive + randomBigIntBelowAny(width);
}
