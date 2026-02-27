/**
 * Public number-theory module barrel.
 *
 * Re-exports validated parsing, core arithmetic, CRT solving, primality,
 * prime generation, and RSA helpers from a single import surface.
 */
// Validation helpers
export {
  MathValidationError,
  isNonNegativeIntegerString,
  parseBigIntStrict,
} from './validation';
// Core arithmetic
export { modNormalize, gcd, extendedGCD, modPow, modInverse } from './core';
// Chinese Remainder Theorem
export { solveCRT } from './crt';
// Matrix arithmetic
export {
  reduceMatrixMod,
  multiplyMatrixMod,
  assertSquare,
  assertInvertible,
  determinantMod,
  rrefMatrixMod,
  inverseMatrixMod,
  generateIdentityMatrix,
  generateRandomInvertibleMatrixMod,
  type MatrixRrefModResult,
} from './matrix';
// Matrix text adapters
export { parseMatrixInput, matrixToString } from './matrixText';
// Primality checks
export { primalityCheck } from './primality/checkPrime';
// Prime generation
export {
  generatePrimes,
  generatePrimesWithProgress,
  getPrimeGenerationWarnThreshold,
  validatePrimeGenerationRequest,
} from './primality/generatePrime';
export {
  MAX_GENERATED_PRIME_BITS,
  MAX_GENERATED_PRIME_DIGITS,
} from './primality/constants';
// RSA helpers
export {
  DEFAULT_CUSTOM_ALPHABET,
  isAsciiOnly,
  buildAlphabetEncoding,
  getDefaultBlockSize,
  getModulusByteLength,
  bigIntToBytes,
  bytesToBigInt,
  DEFAULT_RSA_PUBLIC_EXPONENT,
  INVALID_RSA_EXPONENT_HINT,
  computeModulus,
  computePhi,
  computeLambdaN,
  computeQInverseModP,
  isValidPublicExponentForPhi,
  selectDefaultPublicExponent,
  computePrivateExponent,
  resolveRsaBlockSize,
  encryptRsaMessage,
  decryptRsaMessage,
  formatCiphertextBlocks,
  parseCiphertextInputToDecimal,
  RSA_WHEEL_PRECHECK_PRIMES,
  RSA_QUICK_PRECHECK_PRIMES,
  integerSqrt,
  findPrimeFactorsInRange,
  runRsaRecoveryPrechecks,
  buildRsaRecoveryRanges,
  type AlphabetEncoding,
  type BuildAlphabetEncodingOptions,
  type ResolveRsaBlockSizeOptions,
  type EncryptRsaMessageOptions,
  type DecryptRsaMessageOptions,
  bigIntToBase64UrlUInt,
  buildRsaPublicJwk,
  buildRsaPrivateJwk,
  exportRsaPublicKeyToPem,
  exportRsaKeyPairToPem,
  type RsaPrivateKeyComponents,
  type RsaPublicPemExportOptions,
  type RsaPemExportOptions,
  type RsaPemExportResult,
  type RsaFactorPair,
  type RsaRecoveryRange,
  type FindPrimeFactorsInRangeOptions,
  type RunRsaRecoveryPrechecksOptions,
} from './rsa';
// Public number-theory types
export type {
  PrimalityMethodSelection,
  PrimalityCheckOptions,
  PrimeSizeType,
  PrimeGenerationOptions,
  PrimeGenerationCountPolicy,
  PrimeGeneratorWorkerRequest,
  PrimeGeneratorWorkerProgressMessage,
  PrimeGeneratorWorkerHeartbeatMessage,
  PrimeGeneratorWorkerCompletedMessage,
  PrimeGeneratorWorkerErrorMessage,
  PrimeGeneratorWorkerResponse,
  Vector,
} from '../../types';
