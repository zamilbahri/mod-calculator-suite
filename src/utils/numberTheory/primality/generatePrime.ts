/**
 * Prime generation utilities with configurable size, method, and progress hooks.
 */
import { MathValidationError } from '../validation';
import { randomBigIntInRange } from '../random';
import { primalityCheck } from './checkPrime';
import type {
  PrimeGenerationOptions,
  PrimeSizeType,
  PrimalityMethodSelection,
} from '../../../types';
import {
  MAX_GENERATED_PRIME_BITS,
  MAX_GENERATED_PRIME_DIGITS,
  PRIME_GENERATION_COUNT_POLICIES,
} from './constants';

/**
 * Estimates bit size from a requested prime size unit.
 *
 * @param {number} size - Requested prime size.
 * @param {PrimeSizeType} sizeType - Size unit (`bits` or `digits`).
 * @returns {number} Conservative bit estimate used for policy checks.
 */
function estimatedBitsForSize(size: number, sizeType: PrimeSizeType): number {
  if (sizeType === 'bits') return size;
  // digits -> conservative bit estimate
  return Math.ceil(size * Math.log2(10));
}

/**
 * Returns the policy bucket for a requested bit size.
 *
 * @param {number} bits - Requested bits.
 * @returns {(typeof PRIME_GENERATION_COUNT_POLICIES)[number] | null} Matching policy or null.
 */
function getPrimeGenerationCountPolicy(bits: number) {
  return PRIME_GENERATION_COUNT_POLICIES.find((p) => bits <= p.maxBits) ?? null;
}

/**
 * Returns UI warning threshold for requested generation parameters.
 *
 * @param {number} size - Requested prime size.
 * @param {PrimeSizeType} sizeType - Size unit.
 * @returns {number | null} Count threshold that should trigger warning, or null.
 */
export function getPrimeGenerationWarnThreshold(
  size: number,
  sizeType: PrimeSizeType,
): number | null {
  const bits = estimatedBitsForSize(size, sizeType);
  return getPrimeGenerationCountPolicy(bits)?.warnAt ?? null;
}

/**
 * Validates prime generation request constraints.
 *
 * @param {number} size - Prime size.
 * @param {PrimeSizeType} sizeType - Size unit.
 * @param {number} [count=1] - Number of primes requested.
 * @returns {string | null} Error message when invalid, otherwise null.
 */
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
  if (sizeType === 'bits') {
    if (size > MAX_GENERATED_PRIME_BITS) {
      return `Maximum size is ${MAX_GENERATED_PRIME_BITS} bits.`;
    }
    if (size < 2) {
      return 'Bit size must be at least 2.';
    }
  }
  if (sizeType === 'digits' && size > MAX_GENERATED_PRIME_DIGITS) {
    return `Maximum size is ${MAX_GENERATED_PRIME_DIGITS} digits.`;
  }

  const bits = estimatedBitsForSize(size, sizeType);
  const policy = getPrimeGenerationCountPolicy(bits);
  if (!policy) {
    return `Prime size must be at most ${MAX_GENERATED_PRIME_BITS} bits (~1233 digits).`;
  }
  if (count > policy.maxCount) {
    return `Maximum number of generated primes at this size is ${policy.maxCount}.`;
  }

  return null;
}

/**
 * Computes `10^exp` as bigint.
 *
 * @param {number} exp - Decimal exponent.
 * @returns {bigint} Power of ten.
 */
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

/**
 * Generates one probable prime with periodic attempt callbacks.
 *
 * @param {number} size - Target size.
 * @param {PrimeSizeType} sizeType - Size unit.
 * @param {PrimalityMethodSelection} method - Primality method.
 * @param {number} millerRabinRounds - Miller-Rabin rounds.
 * @param {(attempts: number) => void} [onAttempt] - Called every 32 attempts.
 * @returns {bigint} Generated prime candidate that passed the selected test.
 */
function generateOnePrime(
  size: number,
  sizeType: PrimeSizeType,
  method: PrimalityMethodSelection,
  millerRabinRounds: number,
  onAttempt?: (attempts: number) => void,
): bigint {
  let attempts = 0;
  while (true) {
    attempts++;
    if (onAttempt && attempts % 32 === 0) {
      onAttempt(attempts);
    }

    const candidate =
      sizeType === 'bits'
        ? randomOddCandidateByBits(size)
        : randomOddCandidateByDigits(size);
    if (isCandidatePrime(candidate, method, millerRabinRounds)) {
      return candidate;
    }
  }
}

/**
 * Generates one or more primes synchronously.
 *
 * @param {PrimeGenerationOptions} options - Prime generation parameters.
 * @returns {bigint[]} Generated primes.
 * @throws {MathValidationError} If request constraints are invalid.
 *
 * @example
 * generatePrimes({ size: 512, sizeType: 'bits', count: 2 })
 */
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

/**
 * Generates one or more primes with progress and heartbeat callbacks.
 *
 * Heartbeats report attempt counts while searching for each prime.
 *
 * @param {PrimeGenerationOptions} options - Prime generation parameters.
 * @param {(completed: number, total: number, prime: bigint) => void} [onProgress] - Called after each prime.
 * @param {(primeIndex: number, total: number, attempts: number) => void} [onHeartbeat] - Called during attempts.
 * @returns {Promise<bigint[]>} Generated primes.
 * @throws {MathValidationError} If request constraints are invalid.
 */
export async function generatePrimesWithProgress(
  options: PrimeGenerationOptions,
  onProgress?: (completed: number, total: number, prime: bigint) => void,
  onHeartbeat?: (primeIndex: number, total: number, attempts: number) => void,
): Promise<bigint[]> {
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
    const prime = generateOnePrime(
      options.size,
      options.sizeType,
      method,
      millerRabinRounds,
      (attempts) => onHeartbeat?.(i + 1, count, attempts),
    );
    primes.push(prime);
    onProgress?.(i + 1, count, prime);
    await new Promise((r) => setTimeout(r, 0));
  }
  return primes;
}
