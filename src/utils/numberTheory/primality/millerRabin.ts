/**
 * Miller-Rabin probable-prime testing utilities.
 */
import { modNormalize, modPow } from '../core';
import { randomBigIntBelow } from '../random';

/**
 * Decomposes `n - 1` into `d * 2^s` with odd `d`.
 *
 * @param {bigint} n - Candidate integer.
 * @returns {{ d: bigint; s: number }} Odd component and exponent of two.
 */
function decomposeNMinusOne(n: bigint): { d: bigint; s: number } {
  let d = n - 1n;
  let s = 0;
  while ((d & 1n) === 0n) {
    d >>= 1n;
    s++;
  }
  return { d, s };
}

/**
 * Runs a strong probable-prime test for a single base.
 *
 * @param {bigint} n - Candidate integer.
 * @param {bigint} aIn - Witness base.
 * @returns {boolean} `true` if `n` passes for this base.
 */
export function isStrongProbablePrimeForBase(n: bigint, aIn: bigint): boolean {
  if (n < 2n) return false;
  if (n === 2n || n === 3n) return true;
  if ((n & 1n) === 0n) return false;

  const a = modNormalize(aIn, n);
  if (a === 0n) return true;

  const { d, s } = decomposeNMinusOne(n);
  let x = modPow(a, d, n);
  if (x === 1n || x === n - 1n) return true;

  for (let r = 1; r < s; r++) {
    x = modNormalize(x * x, n);
    if (x === n - 1n) return true;
  }
  return false;
}

/**
 * Runs Miller-Rabin with randomized unique bases.
 *
 * @param {bigint} n - Candidate integer.
 * @param {number} [iterations=24] - Number of rounds.
 * @returns {{ isProbablePrime: boolean; witness?: bigint }} Result and witness for composite findings.
 */
export function isMillerRabinProbablePrime(
  n: bigint,
  iterations = 24,
): { isProbablePrime: boolean; witness?: bigint } {
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
      a = 2n + randomBigIntBelow(n - 3n);
    } while (usedBases.has(a));
    usedBases.add(a);

    if (!isStrongProbablePrimeForBase(n, a)) {
      return { isProbablePrime: false, witness: a };
    }
  }

  return { isProbablePrime: true };
}

/**
 * Returns the Miller-Rabin false-prime bound exponent.
 *
 * For `t` rounds, error is bounded by approximately `2^(-2t)`.
 *
 * @param {number} iterations - Number of rounds.
 * @returns {number} Exponent in `2^-k`.
 */
export function millerRabinErrorProbabilityExponent(iterations: number): number {
  return 2 * iterations;
}
