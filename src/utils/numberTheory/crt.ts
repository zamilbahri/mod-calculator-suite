/**
 * Chinese Remainder Theorem utilities for pairwise-coprime systems.
 *
 * Implements the standard constructive CRT solver:
 * `x ≡ a_i (mod m_i)` where all moduli are pairwise coprime.
 */
import type { CRTEquationParsed, CRTSolution } from '../../types';
import { gcd, modInverse, modNormalize } from './core';

/**
 * Checks whether all numbers in a list are pairwise coprime.
 *
 * @param {bigint[]} nums - Moduli to check.
 * @returns {boolean} `true` when every pair has gcd 1.
 */
function arePairwiseCoprime(nums: bigint[]): boolean {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (gcd(nums[i], nums[j]) !== 1n) return false;
    }
  }
  return true;
}

/**
 * Solves a system of congruences with pairwise-coprime moduli.
 *
 * @param {CRTEquationParsed[]} equations - Parsed equations `(a, m)` representing `x ≡ a (mod m)`.
 * @returns {CRTSolution} Canonical solution `x` with modulus product `M`.
 * @throws {Error} If no equations are provided or moduli are not pairwise coprime.
 *
 * @example
 * solveCRT([
 *   { a: 2n, m: 3n },
 *   { a: 3n, m: 5n },
 *   { a: 2n, m: 7n },
 * ]) // { x: 23n, M: 105n }
 *
 * @example
 * // Throws: moduli are not pairwise coprime
 * solveCRT([
 *   { a: 1n, m: 6n },
 *   { a: 3n, m: 9n },
 * ])
 */
export function solveCRT(equations: CRTEquationParsed[]): CRTSolution {
  if (equations.length === 0) {
    throw new Error('No equations provided.');
  }

  if (equations.length === 1) {
    const { a, m } = equations[0];
    return { x: modNormalize(a, m), M: m };
  }

  const moduli = equations.map((p) => p.m);
  if (!arePairwiseCoprime(moduli)) {
    throw new Error(
      'Moduli must be pairwise coprime for the standard CRT solver.',
    );
  }

  let M = 1n;
  for (const { m } of equations) M *= m;

  let sum = 0n;
  for (const { a, m } of equations) {
    const Mi = M / m;
    const inv = modInverse(Mi % m, m);
    const ai = modNormalize(a, m);
    sum += ai * Mi * inv;
  }

  return { x: modNormalize(sum, M), M };
}
