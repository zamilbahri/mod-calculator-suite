// numberTheory.ts - Common number theory utilities for the mod calculators.
import type { CRTSolution, EGCDResult, CRTEquationParsed } from '../types';

/**
 * Custom error class for math validation errors, providing structured information about which fields failed validation and why.
 * May be used with MathErrorView for LaTeX error display in the UI.
 *
 * Includes:
 * - `fieldNames`: An array of field names that caused the validation error.
 * - `reason`: A human-readable explanation of the validation failure.
 * - `expectedValue` (optional): Additional context about the expected value or format.
 *
 * Example usage:
 * throw new MathValidationError(['m1', 'm2'], 'are not pairwise coprime');
 * This would create an error with the message "m1, m2 are not pairwise coprime".
 *
 * Example usage with expected value:
 * throw new MathValidationError('n', 'must be greater than', '2');
 * This would create an error with the message "n must be greater than 2".
 *
 * The class extends the built-in Error class, allowing it to be used in try-catch blocks and to have a stack trace.
 */
export class MathValidationError extends Error {
  fieldNames: string[];
  reason: string;
  expectedValue?: string;

  constructor(
    fieldNames: string | string[],
    reason: string,
    expectedValue?: string,
  ) {
    // Force fieldNames into an array if a single string is passed
    const namesArray = Array.isArray(fieldNames) ? fieldNames : [fieldNames];
    const valueSuffix = expectedValue !== undefined ? ` ${expectedValue}` : '';

    // e.g., "m_{1}, m_{2} are not pairwise coprime"
    super(`${namesArray.join(', ')} ${reason}${valueSuffix}`);

    this.name = 'MathValidationError';
    this.fieldNames = namesArray;
    this.reason = reason;
    this.expectedValue = expectedValue;
  }
}

// ---------- Input Validation ----------

export function isNonNegativeIntegerString(s: string): boolean {
  return s === '' || /^\d+$/.test(s);
}

export function parseBigIntStrict(input: string, fieldName = 'value'): bigint {
  const s = input.trim();
  if (s === '') {
    throw new MathValidationError(fieldName, 'cannot be empty.');
  }
  if (!isNonNegativeIntegerString(s)) {
    throw new MathValidationError(fieldName, 'must be a non-negative integer.');
  }
  return BigInt(s);
}

// ---------- Number Theory Utilities ----------

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

export function arePairwiseCoprime(nums: bigint[]): boolean {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (gcd(nums[i], nums[j]) !== 1n) return false;
    }
  }
  return true;
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
 * For the course calculators, we’ll typically use modulus.
 */
export function modPow(a: bigint, n: bigint, m: bigint): bigint {
  if (n < 0n) throw new MathValidationError('n', 'must be non-negative.');
  if (m <= 0n) throw new MathValidationError('m', 'must be positive.');

  if (m === 1n) return 0n; // a^n mod 1 is always 0

  let base = ((a % m) + m) % m;

  let exp = n;
  let result = 1n;

  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % m;
    base = (base * base) % m;
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

/**
 * Solves a system of congruences using the Chinese Remainder Theorem.
 * Standard CRT requires all moduli to be pairwise coprime.
 */
export function solveCRT(equations: CRTEquationParsed[]): CRTSolution {
  if (equations.length === 0) {
    throw new Error('No equations provided.');
  }

  // Trivial case: single congruence
  if (equations.length === 1) {
    const { a, m } = equations[0];
    return { x: modNormalize(a, m), M: m };
  }

  // Standard CRT requires pairwise coprime moduli
  const moduli = equations.map((p) => p.m);
  if (!arePairwiseCoprime(moduli)) {
    throw new Error(
      'Moduli must be pairwise coprime for the standard CRT solver.',
    );
  }

  // Compute M = product of all moduli
  let M = 1n;
  for (const { m } of equations) M *= m;

  // x = Sum( a_i * M_i * inv(M_i mod m_i) (mod M) )
  let sum = 0n;
  for (const { a, m } of equations) {
    const Mi = M / m;
    const inv = modInverse(Mi % m, m);
    const ai = modNormalize(a, m);
    sum += ai * Mi * inv;
  }

  return { x: modNormalize(sum, M), M };
}

// ---------- Primality Testing ----------
const SMALL_PRIMES: bigint[] = [
  2n,
  3n,
  5n,
  7n,
  11n,
  13n,
  17n,
  19n,
  23n,
  29n,
  31n,
  37n,
];

const MR_BASE_POOL: bigint[] = [
  2n,
  3n,
  5n,
  7n,
  11n,
  13n,
  17n,
  19n,
  23n,
  29n,
  31n,
  37n,
  41n,
  43n,
  47n,
  53n,
  59n,
  61n,
  67n,
  71n,
  73n,
  79n,
  83n,
  89n,
  97n,
  101n,
  103n,
  107n,
  109n,
  113n,
  127n,
  131n,
  137n,
  139n,
  149n,
  151n,
  157n,
  163n,
  167n,
  173n,
];

// Decomposes n-1 into 2^s * d where d is odd.
// Used in Miller-Rabin: we need n-1 = 2^s * d for the test.
function decomposeNMinusOne(n: bigint): { d: bigint; s: number } {
  let d = n - 1n;
  let s = 0;
  // Keep dividing by 2 (right shift) until d is odd
  while ((d & 1n) === 0n) {
    d >>= 1n;
    s++;
  }
  return { d, s };
}

// Returns true if n passes the Miller-Rabin test for base a.
export function isStrongProbablePrimeForBase(n: bigint, aIn: bigint): boolean {
  if (n < 2n) return false;
  if (n === 2n || n === 3n) return true;
  if ((n & 1n) === 0n) return false;

  const a = modNormalize(aIn, n);
  if (a === 0n) return true;

  const { d, s } = decomposeNMinusOne(n);
  // Compute a^d mod n
  let x = modPow(a, d, n);
  // First condition: a^d ≡ 1 (mod n), or a^d ≡ -1 (mod n)
  if (x === 1n || x === n - 1n) return true;

  // Second condition: check if a^(2^r * d) ≡ -1 (mod n) for some r in [1, s)
  // by repeatedly squaring x
  for (let r = 1; r < s; r++) {
    x = modNormalize(x * x, n);
    if (x === n - 1n) return true;
  }
  return false;
}

export function isMillerRabinProbablePrime(
  n: bigint,
  iterations = 24,
): boolean {
  if (n < 2n) return false;

  // Quick rejection: check against small primes
  for (const p of SMALL_PRIMES) {
    if (n === p) return true;
    if (n % p === 0n) return false;
  }

  if ((n & 1n) === 0n) return false;

  // Run Miller-Rabin test with multiple bases for higher confidence
  // With k iterations, error probability is at most 4^(-k)
  for (let i = 0; i < iterations; i++) {
    const baseCandidate =
      i < MR_BASE_POOL.length ? MR_BASE_POOL[i] : 2n + 2n * BigInt(i);
    const a = baseCandidate % n;
    if (a === 0n || a === 1n) continue;
    if (!isStrongProbablePrimeForBase(n, a)) return false;
  }

  return true;
}

export function primalityCheck(n: bigint): boolean {
  return isMillerRabinProbablePrime(n, 24);
}
