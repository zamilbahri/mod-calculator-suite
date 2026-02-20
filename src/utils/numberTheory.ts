export interface EGCDResult {
  gcd: bigint;
  x: bigint;
  y: bigint;
}

export function isNonNegativeIntegerString(s: string): boolean {
  return /^\d+$/.test(s);
}

export function parseBigIntStrict(input: string, fieldName = 'value'): bigint {
  const s = input.trim();
  if (!isNonNegativeIntegerString(s)) {
    throw new Error(`${fieldName} must be a positive integer.`);
  }
  return BigInt(s);
}

export function modNormalize(x: bigint, m: bigint): bigint {
  // assumes m > 0
  const r = x % m;
  return r >= 0n ? r : r + m;
}

export function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

export function extendedGCD(a: bigint, b: bigint): EGCDResult {
  // Iterative extended Euclidean algorithm.
  let oldR = a;
  let r = b;
  let oldS = 1n;
  let s = 0n;
  let oldT = 0n;
  let t = 1n;

  while (r !== 0n) {
    const q = oldR / r;

    const nextR = oldR - q * r;
    oldR = r;
    r = nextR;

    const nextS = oldS - q * s;
    oldS = s;
    s = nextS;

    const nextT = oldT - q * t;
    oldT = t;
    t = nextT;
  }

  // oldR = a*oldS + b*oldT
  // Normalize so gcd is non-negative, and preserve equality.
  if (oldR < 0n) {
    oldR = -oldR;
    oldS = -oldS;
    oldT = -oldT;
  }

  return { gcd: oldR, x: oldS, y: oldT };
}

/**
 * Fast exponentiation: a^n mod m
 * If m <= 1, we treat it as "no modulus" and compute exact power (careful: can explode!).
 * For the course calculators, we’ll typically use modulus.
 */
export function modPow(a: bigint, n: bigint, m: bigint): bigint {
  if (n < 0n) throw new Error('Exponent n must be non-negative.');
  if (m === 0n) throw new Error('Modulus m must be non-zero.');

  const mod = m < 0n ? -m : m;
  let base = ((a % mod) + mod) % mod;

  let exp = n;
  let result = 1n;

  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % mod;
    base = (base * base) % mod;
    exp >>= 1n;
  }
  return result;
}

export function modInverse(a: bigint, m: bigint): bigint {
  if (m === 0n) throw new Error('Modulus m must be non-zero.');
  const mod = m < 0n ? -m : m;

  const { gcd: g, x } = extendedGCD(a, mod);
  if (g !== 1n) {
    throw new Error('Inverse does not exist (a and m are not coprime).');
  }
  // Ensure positive representative
  return ((x % mod) + mod) % mod;
}
