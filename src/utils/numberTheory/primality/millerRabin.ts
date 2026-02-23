import { modNormalize, modPow } from '../core';
import { randomBigIntBelow } from '../random';

function decomposeNMinusOne(n: bigint): { d: bigint; s: number } {
  let d = n - 1n;
  let s = 0;
  while ((d & 1n) === 0n) {
    d >>= 1n;
    s++;
  }
  return { d, s };
}

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

export function millerRabinErrorProbabilityExponent(iterations: number): number {
  return 2 * iterations;
}
