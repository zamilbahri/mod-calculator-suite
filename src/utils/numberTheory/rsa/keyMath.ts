import { gcd, modInverse } from '../core';

const DEFAULT_RSA_EXPONENT_CANDIDATES = [65537n, 257n, 17n, 3n] as const;

export const DEFAULT_RSA_PUBLIC_EXPONENT = '65537';

export const INVALID_RSA_EXPONENT_HINT =
  'Enter e coprime to \u03D5 and e < n';

export const computeModulus = (p: bigint, q: bigint): bigint => p * q;

export const computePhi = (p: bigint, q: bigint): bigint =>
  (p - 1n) * (q - 1n);

export const computeLambdaN = (p: bigint, q: bigint): bigint => {
  const pMinus1 = p - 1n;
  const qMinus1 = q - 1n;
  return (pMinus1 / gcd(pMinus1, qMinus1)) * qMinus1;
};

export const computeQInverseModP = (q: bigint, p: bigint): bigint =>
  modInverse(q, p);

export const isValidPublicExponentForPhi = (e: bigint, phi: bigint): boolean =>
  e > 1n && e < phi && gcd(e, phi) === 1n;

export const selectDefaultPublicExponent = (phi: bigint): bigint | undefined =>
  DEFAULT_RSA_EXPONENT_CANDIDATES.find((candidate) =>
    isValidPublicExponentForPhi(candidate, phi),
  );

export const computePrivateExponent = (e: bigint, phi: bigint): bigint =>
  modInverse(e, phi);
