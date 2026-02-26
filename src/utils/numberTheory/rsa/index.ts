/**
 * RSA helper barrel for encoding, key math, crypto operations,
 * PEM export, and recovery utilities.
 */
// Encoding helpers
export {
  DEFAULT_CUSTOM_ALPHABET,
  isAsciiOnly,
  buildAlphabetEncoding,
  getDefaultBlockSize,
  getModulusByteLength,
  bigIntToBytes,
  bytesToBigInt,
  type AlphabetEncoding,
  type BuildAlphabetEncodingOptions,
} from './encoding';

// Key math helpers
export {
  DEFAULT_RSA_PUBLIC_EXPONENT,
  INVALID_RSA_EXPONENT_HINT,
  computeModulus,
  computePhi,
  computeLambdaN,
  computeQInverseModP,
  isValidPublicExponentForPhi,
  selectDefaultPublicExponent,
  computePrivateExponent,
} from './keyMath';

// Encryption and decryption helpers
export {
  resolveRsaBlockSize,
  encryptRsaMessage,
  decryptRsaMessage,
  formatCiphertextBlocks,
  parseCiphertextInputToDecimal,
  type ResolveRsaBlockSizeOptions,
  type EncryptRsaMessageOptions,
  type DecryptRsaMessageOptions,
} from './crypto';

// JWK/PEM export helpers
export {
  bigIntToBase64UrlUInt,
  buildRsaPublicJwk,
  buildRsaPrivateJwk,
  exportRsaPublicKeyToPem,
  exportRsaKeyPairToPem,
  type RsaPrivateKeyComponents,
  type RsaPublicPemExportOptions,
  type RsaPemExportOptions,
  type RsaPemExportResult,
} from './pem';

// Recovery helpers
export {
  RSA_WHEEL_PRECHECK_PRIMES,
  RSA_QUICK_PRECHECK_PRIMES,
  integerSqrt,
  findPrimeFactorsInRange,
  runRsaRecoveryPrechecks,
  buildRsaRecoveryRanges,
  type RsaFactorPair,
  type RsaRecoveryRange,
  type FindPrimeFactorsInRangeOptions,
  type RunRsaRecoveryPrechecksOptions,
} from './recovery';
