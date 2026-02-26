/**
 * RSA key mathematics helpers.
 *
 * Provides modulus/totient computations and public/private exponent checks.
 */
import { gcd, modInverse } from '../core';

const DEFAULT_RSA_EXPONENT_CANDIDATES = [65537n, 257n, 17n, 3n] as const;

/** Default public exponent shown in UI fields. */
export const DEFAULT_RSA_PUBLIC_EXPONENT = '65537';

/** Hint shown when user-provided public exponent is invalid. */
export const INVALID_RSA_EXPONENT_HINT =
  'Enter e coprime to \u03D5 and e < n';

/**
 * Computes RSA modulus `n = p * q`.
 *
 * @param {bigint} p - Prime factor `p`.
 * @param {bigint} q - Prime factor `q`.
 * @returns {bigint} RSA modulus.
 */
export const computeModulus = (p: bigint, q: bigint): bigint => p * q;

/**
 * Computes Euler's totient for RSA modulus.
 *
 * @param {bigint} p - Prime factor `p`.
 * @param {bigint} q - Prime factor `q`.
 * @returns {bigint} `phi(n) = (p - 1)(q - 1)`.
 */
export const computePhi = (p: bigint, q: bigint): bigint =>
  (p - 1n) * (q - 1n);

/**
 * Computes Carmichael's lambda for RSA modulus.
 *
 * @param {bigint} p - Prime factor `p`.
 * @param {bigint} q - Prime factor `q`.
 * @returns {bigint} `lambda(n) = lcm(p-1, q-1)`.
 */
export const computeLambdaN = (p: bigint, q: bigint): bigint => {
  const pMinus1 = p - 1n;
  const qMinus1 = q - 1n;
  return (pMinus1 / gcd(pMinus1, qMinus1)) * qMinus1;
};

/**
 * Computes CRT coefficient `q^{-1} mod p`.
 *
 * @param {bigint} q - Prime factor `q`.
 * @param {bigint} p - Prime factor `p`.
 * @returns {bigint} Multiplicative inverse of `q` modulo `p`.
 */
export const computeQInverseModP = (q: bigint, p: bigint): bigint =>
  modInverse(q, p);

/**
 * Validates candidate public exponent against `phi(n)`.
 *
 * @param {bigint} e - Candidate public exponent.
 * @param {bigint} phi - Euler totient.
 * @returns {boolean} `true` when `1 < e < phi` and `gcd(e, phi) = 1`.
 */
export const isValidPublicExponentForPhi = (e: bigint, phi: bigint): boolean =>
  e > 1n && e < phi && gcd(e, phi) === 1n;

/**
 * Selects a safe default public exponent for a given totient.
 *
 * @param {bigint} phi - Euler totient.
 * @returns {bigint | undefined} First valid default exponent, if any.
 */
export const selectDefaultPublicExponent = (phi: bigint): bigint | undefined =>
  DEFAULT_RSA_EXPONENT_CANDIDATES.find((candidate) =>
    isValidPublicExponentForPhi(candidate, phi),
  );

/**
 * Computes private exponent `d = e^{-1} mod phi`.
 *
 * @param {bigint} e - Public exponent.
 * @param {bigint} phi - Euler totient.
 * @returns {bigint} Private exponent.
 * @throws {Error} If inverse does not exist.
 */
export const computePrivateExponent = (e: bigint, phi: bigint): bigint =>
  modInverse(e, phi);
