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

function estimatedBitsForSize(size: number, sizeType: PrimeSizeType): number {
  if (sizeType === 'bits') return size;
  // digits -> conservative bit estimate
  return Math.ceil(size * Math.log2(10));
}

function getPrimeGenerationCountPolicy(bits: number) {
  return PRIME_GENERATION_COUNT_POLICIES.find((p) => bits <= p.maxBits) ?? null;
}

export function getPrimeGenerationWarnThreshold(
  size: number,
  sizeType: PrimeSizeType,
): number | null {
  const bits = estimatedBitsForSize(size, sizeType);
  return getPrimeGenerationCountPolicy(bits)?.warnAt ?? null;
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
    return `Prime size must be at most ${MAX_GENERATED_PRIME_BITS} bits.`;
  }
  if (count > policy.maxCount) {
    return `Maximum number of generated primes at this size is ${policy.maxCount}.`;
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

export async function generatePrimesWithProgress(
  options: PrimeGenerationOptions,
  onProgress?: (completed: number, total: number, prime: bigint) => void,
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
    );
    primes.push(prime);
    onProgress?.(i + 1, count, prime);
    await new Promise((r) => setTimeout(r, 0));
  }
  return primes;
}
