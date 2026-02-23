import type { CRTEquationParsed, CRTSolution } from '../../types';
import { gcd, modInverse, modNormalize } from './core';

function arePairwiseCoprime(nums: bigint[]): boolean {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (gcd(nums[i], nums[j]) !== 1n) return false;
    }
  }
  return true;
}

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
