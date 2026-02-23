// numberTheory.ts - Common number theory utilities for the mod calculators.
import type {
  CRTSolution,
  EGCDResult,
  CRTEquationParsed,
  PrimalityCheckResult,
} from '../types';

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

function arePairwiseCoprime(nums: bigint[]): boolean {
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

  let base = a % m; // ensure base is in [0, m-1]
  if (base < 0n) base += m; // account for negative a (unlikely due to input sanitization)

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

// A pool of first 101 small primes (except 2) for quick checks
const SMALL_PRIMES: bigint[] = [
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
  179n,
  181n,
  191n,
  193n,
  197n,
  199n,
  211n,
  223n,
  227n,
  229n,
  233n,
  239n,
  241n,
  251n,
  257n,
  263n,
  269n,
  271n,
  277n,
  281n,
  283n,
  293n,
  307n,
  311n,
  313n,
  317n,
  331n,
  337n,
  347n,
  349n,
  353n,
  359n,
  367n,
  373n,
  379n,
  383n,
  389n,
  397n,
  401n,
  409n,
  419n,
  421n,
  431n,
  433n,
  439n,
  443n,
  449n,
  457n,
  461n,
  463n,
  467n,
  479n,
  487n,
  491n,
  499n,
  503n,
  509n,
  521n,
  523n,
  541n,
  547n,
];

// Returns the number of bits needed to represent n in binary, i.e. floor(log2(n)) + 1 for n > 0.
function bitLength(n: bigint): number {
  return n.toString(2).length;
}

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

// Returns a random bigint uniformly distributed in [0, upperExclusive) using rejection sampling. Assumes upperExclusive > 3.
function randomBigIntBelow(upperExclusive: bigint): bigint {
  if (upperExclusive <= 2n) {
    throw new MathValidationError('n', 'must be greater than', '3');
  }
  return randomBigIntBelowAny(upperExclusive);
}

// Returns true if n passes the Miller-Rabin test for base a.
function isStrongProbablePrimeForBase(n: bigint, aIn: bigint): boolean {
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

// Returns true if n is a probable prime with the given number of Miller-Rabin iterations.
// Assume small primes are already checked before calling this function
function isMillerRabinProbablePrime(
  n: bigint,
  iterations = 24,
): { isProbablePrime: boolean; witness?: bigint } {
  // Run Miller-Rabin test with multiple bases for higher confidence
  // Bases are sampled uniformly from [2, n-2] and de-duplicated per run.
  const usedBases = new Set<bigint>();
  const maxUniqueBases = n - 3n;
  const rounds = Math.min(
    iterations,
    maxUniqueBases > BigInt(Number.MAX_SAFE_INTEGER)
      ? iterations
      : Number(maxUniqueBases),
  );

  for (let i = 0; i < rounds; i++) {
    let a: bigint;
    do {
      a = 2n + randomBigIntBelow(n - 3n); // uniform in [2, n-2]
    } while (usedBases.has(a));
    usedBases.add(a);

    if (!isStrongProbablePrimeForBase(n, a)) {
      return { isProbablePrime: false, witness: a };
    }
  }

  return { isProbablePrime: true };
}

const TWO_POW_64 = 1n << 64n;

export type PrimalityMethodSelection = 'Auto' | 'Miller-Rabin' | 'Baillie-PSW';

export interface PrimalityCheckOptions {
  method?: PrimalityMethodSelection;
  millerRabinRounds?: number;
}

function randomBigIntBelowAny(upperExclusive: bigint): bigint {
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

function randomBigIntInRange(
  minInclusive: bigint,
  maxInclusive: bigint,
): bigint {
  if (maxInclusive < minInclusive) {
    throw new MathValidationError('range', 'is invalid.');
  }
  const width = maxInclusive - minInclusive + 1n;
  return minInclusive + randomBigIntBelowAny(width);
}

export type PrimeSizeType = 'digits' | 'bits';

export interface PrimeGenerationOptions {
  size: number;
  sizeType: PrimeSizeType;
  count?: number;
  method?: PrimalityMethodSelection;
  millerRabinRounds?: number;
}

export const MAX_GENERATED_PRIME_BITS = 4096;
export const MAX_GENERATED_PRIME_DIGITS = 1300;
export const MAX_GENERATED_PRIME_COUNT = 5;

function isPerfectSquare(n: bigint): boolean {
  if (n < 0n) return false;
  if (n < 2n) return true;
  let x0 = n;
  let x1 = (x0 + 1n) >> 1n;
  while (x1 < x0) {
    x0 = x1;
    x1 = (x1 + n / x1) >> 1n;
  }
  return x0 * x0 === n;
}

function jacobiSymbol(aIn: bigint, nIn: bigint): -1 | 0 | 1 {
  if (nIn <= 0n || (nIn & 1n) === 0n) return 0;
  let a = modNormalize(aIn, nIn);
  let n = nIn;
  let sign = 1;

  while (a !== 0n) {
    while ((a & 1n) === 0n) {
      a >>= 1n;
      const r = n & 7n;
      if (r === 3n || r === 5n) sign = -sign;
    }

    const tmp = a;
    a = n;
    n = tmp;

    if ((a & 3n) === 3n && (n & 3n) === 3n) sign = -sign;
    a %= n;
  }

  if (n === 1n) return sign as -1 | 1;
  return 0;
}

function div2Mod(x: bigint, n: bigint): bigint {
  let v = modNormalize(x, n);
  if ((v & 1n) !== 0n) v += n;
  return v >> 1n;
}

function lucasSequenceMod(
  n: bigint,
  P: bigint,
  Q: bigint,
  k: bigint,
  D: bigint,
): { U: bigint; V: bigint; Qk: bigint } {
  if (k === 0n) return { U: 0n, V: 2n, Qk: 1n };

  const pMod = modNormalize(P, n);
  const qMod = modNormalize(Q, n);
  const dMod = modNormalize(D, n);
  const bits = k.toString(2);

  let U = 1n;
  let V = pMod;
  let Qk = qMod;

  for (let i = 1; i < bits.length; i++) {
    U = modNormalize(U * V, n);
    V = modNormalize(V * V - 2n * Qk, n);
    Qk = modNormalize(Qk * Qk, n);

    if (bits[i] === '1') {
      const nextU = div2Mod(pMod * U + V, n);
      const nextV = div2Mod(dMod * U + pMod * V, n);
      U = nextU;
      V = nextV;
      Qk = modNormalize(Qk * qMod, n);
    }
  }

  return { U, V, Qk };
}

function decompose(n: bigint): { d: bigint; s: number } {
  let d = n;
  let s = 0;
  while ((d & 1n) === 0n) {
    d >>= 1n;
    s++;
  }
  return { d, s };
}

function isStrongLucasProbablePrime(
  n: bigint,
  D: bigint,
  P: bigint,
  Q: bigint,
): boolean {
  const { d, s } = decompose(n + 1n);
  const lucas = lucasSequenceMod(n, P, Q, d, D);

  if (lucas.U === 0n || lucas.V === 0n) return true;

  let V = lucas.V;
  let Qk = lucas.Qk;

  for (let r = 1; r < s; r++) {
    V = modNormalize(V * V - 2n * Qk, n);
    Qk = modNormalize(Qk * Qk, n);
    if (V === 0n) return true;
  }

  return false;
}

function isBPSWProbablePrime(n: bigint): boolean {
  if (!isStrongProbablePrimeForBase(n, 2n)) return false;
  if (isPerfectSquare(n)) return false;

  let D = 5n;
  while (true) {
    const j = jacobiSymbol(D, n);
    if (j === -1) break;
    if (j === 0) return false;
    D = D > 0n ? -(D + 2n) : -D + 2n;
  }

  const P = 1n;
  const Q = (1n - D) / 4n;
  return isStrongLucasProbablePrime(n, D, P, Q);
}

function millerRabinErrorProbabilityExponent(iterations: number): number {
  // (1/4)^k = 2^(-2k), so b = 2k in error <= 2^-b.
  return 2 * iterations;
}

export function validatePrimeGenerationRequest(
  size: number,
  sizeType: PrimeSizeType,
  count = 1,
): string | null {
  if (!Number.isInteger(size) || size <= 0) {
    return 'Prime size must be a positive integer.';
  }
  if (!Number.isInteger(count) || count <= 0) {
    return 'Number of primes must be a positive integer.';
  }
  if (count > MAX_GENERATED_PRIME_COUNT) {
    return `Maximum number of generated primes is ${MAX_GENERATED_PRIME_COUNT}.`;
  }
  if (sizeType === 'bits') {
    if (size > MAX_GENERATED_PRIME_BITS) {
      return `Maximum size is ${MAX_GENERATED_PRIME_BITS} bits.`;
    }
    if (size < 2) {
      return 'Bit size must be at least 2.';
    }
    return null;
  }
  if (size > MAX_GENERATED_PRIME_DIGITS) {
    return `Maximum size is ${MAX_GENERATED_PRIME_DIGITS} digits.`;
  }
  return null;
}

function pow10(exp: number): bigint {
  return BigInt(`1${'0'.repeat(exp)}`);
}

function randomOddCandidateByBits(bits: number): bigint {
  const min = 1n << BigInt(bits - 1);
  const max = (1n << BigInt(bits)) - 1n;
  let candidate = randomBigIntInRange(min, max);
  candidate |= 1n;
  candidate |= min;
  return candidate;
}

function randomOddCandidateByDigits(digits: number): bigint {
  if (digits === 1) {
    const oneDigitPrimes = [2n, 3n, 5n, 7n];
    return oneDigitPrimes[Math.floor(Math.random() * oneDigitPrimes.length)];
  }
  const min = pow10(digits - 1);
  const max = pow10(digits) - 1n;
  let candidate = randomBigIntInRange(min, max);
  candidate |= 1n;
  return candidate;
}

function isCandidatePrime(
  candidate: bigint,
  method: PrimalityMethodSelection,
  millerRabinRounds: number,
): boolean {
  const check = primalityCheck(candidate, { method, millerRabinRounds });
  return check.isProbablePrime;
}

function generateOnePrime(
  size: number,
  sizeType: PrimeSizeType,
  method: PrimalityMethodSelection,
  millerRabinRounds: number,
): bigint {
  while (true) {
    const candidate =
      sizeType === 'bits'
        ? randomOddCandidateByBits(size)
        : randomOddCandidateByDigits(size);
    if (isCandidatePrime(candidate, method, millerRabinRounds)) {
      return candidate;
    }
  }
}

export function generatePrimes(options: PrimeGenerationOptions): bigint[] {
  const count = options.count ?? 1;
  const method = options.method ?? 'Auto';
  const millerRabinRounds = options.millerRabinRounds ?? 24;

  const validationError = validatePrimeGenerationRequest(
    options.size,
    options.sizeType,
    count,
  );
  if (validationError) {
    throw new MathValidationError('prime generation', validationError);
  }

  const primes: bigint[] = [];
  for (let i = 0; i < count; i++) {
    primes.push(
      generateOnePrime(
        options.size,
        options.sizeType,
        method,
        millerRabinRounds,
      ),
    );
  }
  return primes;
}

export function primalityCheck(
  n: bigint,
  options: PrimalityCheckOptions | number = 24,
): PrimalityCheckResult {
  const method =
    typeof options === 'number' ? 'Auto' : (options.method ?? 'Auto');
  const roundsInput =
    typeof options === 'number' ? options : (options.millerRabinRounds ?? 24);
  const mrIterations = Math.max(1, Math.floor(roundsInput));

  const exactPrime = (): PrimalityCheckResult => ({
    isProbablePrime: true,
    verdict: 'Prime',
    method: 'Small Prime Check',
    errorProbabilityExponent: 0,
    rounds: 0,
  });
  const exactComposite = (reason: string): PrimalityCheckResult => ({
    isProbablePrime: false,
    verdict: 'Composite',
    method: 'Small Prime Check',
    compositeReason: reason,
    rounds: 0,
  });

  if (n < 2n) return exactComposite('n < 2');
  if (n === 2n) return exactPrime();
  if ((n & 1n) === 0n) return exactComposite('Factor found: 2');

  for (const p of SMALL_PRIMES) {
    if (n === p) return exactPrime();
    if (n % p === 0n) return exactComposite(`Factor found: ${p.toString()}`);
  }

  if (method === 'Baillie-PSW' || (method === 'Auto' && n < TWO_POW_64)) {
    const bpswPrime = isBPSWProbablePrime(n);
    return {
      isProbablePrime: bpswPrime,
      verdict: bpswPrime
        ? n < TWO_POW_64
          ? 'Prime'
          : 'Probably Prime'
        : 'Composite',
      method: 'Baillie-PSW',
      errorProbabilityExponent: bpswPrime ? 0 : undefined,
      compositeReason: bpswPrime ? undefined : 'BPSW test failed',
      rounds: 0,
    };
  }

  const rounds = mrIterations;
  const mrResult = isMillerRabinProbablePrime(n, rounds);
  const primeLike = mrResult.isProbablePrime;
  return {
    isProbablePrime: primeLike,
    verdict: primeLike ? 'Probably Prime' : 'Composite',
    method: 'Miller-Rabin',
    errorProbabilityExponent: primeLike
      ? millerRabinErrorProbabilityExponent(rounds)
      : undefined,
    compositeReason: primeLike ? undefined : 'Miller-Rabin witness found',
    witness: primeLike ? undefined : mrResult.witness,
    rounds: rounds,
  };
}
