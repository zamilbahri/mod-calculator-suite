import { MathValidationError } from './validation';

export function bitLength(n: bigint): number {
  return n.toString(2).length;
}

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

export function randomBigIntBelow(upperExclusive: bigint): bigint {
  if (upperExclusive <= 2n) {
    throw new MathValidationError('n', 'must be greater than', '3');
  }
  return randomBigIntBelowAny(upperExclusive);
}

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
