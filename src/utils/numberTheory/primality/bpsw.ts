/**
 * Baillie-PSW probable-prime test implementation.
 *
 * Combines a base-2 strong probable-prime test with a strong Lucas test.
 */
import { modNormalize } from '../core';
import { isStrongProbablePrimeForBase } from './millerRabin';

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

/**
 * Computes Jacobi symbol `(a/n)` for odd positive `n`.
 *
 * @param {bigint} aIn - Numerator.
 * @param {bigint} nIn - Denominator (odd, positive).
 * @returns {-1 | 0 | 1} Jacobi symbol value.
 */
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

/**
 * Computes `(x / 2) mod n` under odd modulus arithmetic.
 *
 * @param {bigint} x - Value to divide by two.
 * @param {bigint} n - Modulus.
 * @returns {bigint} Result modulo `n`.
 */
function div2Mod(x: bigint, n: bigint): bigint {
  let v = modNormalize(x, n);
  if ((v & 1n) !== 0n) v += n;
  return v >> 1n;
}

/**
 * Evaluates Lucas sequence terms modulo `n` for strong Lucas testing.
 *
 * @param {bigint} n - Candidate modulus.
 * @param {bigint} P - Lucas parameter `P`.
 * @param {bigint} Q - Lucas parameter `Q`.
 * @param {bigint} k - Index.
 * @param {bigint} D - Discriminant.
 * @returns {{ U: bigint; V: bigint; Qk: bigint }} Sequence state at index `k`.
 */
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

/**
 * Runs the strong Lucas probable-prime test component.
 *
 * @param {bigint} n - Candidate integer.
 * @param {bigint} D - Discriminant.
 * @param {bigint} P - Lucas parameter `P`.
 * @param {bigint} Q - Lucas parameter `Q`.
 * @returns {boolean} `true` if Lucas test passes.
 */
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

/**
 * Runs the Baillie-PSW probable-prime test.
 *
 * @param {bigint} n - Candidate integer.
 * @returns {boolean} `true` if `n` passes BPSW.
 */
export function isBPSWProbablePrime(n: bigint): boolean {
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
