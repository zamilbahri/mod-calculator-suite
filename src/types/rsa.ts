import type { PrimeSizeType } from './numberTheory';

/**
 * Shared RSA type definitions.
 *
 * Includes UI mode switches, encoding modes, ciphertext formats,
 * derived key snapshots, and decrypt/recovery worker protocols.
 */

/** Top-level RSA calculator mode. */
export type RsaMode = 'encrypt' | 'decrypt';

/** Text encoding strategy for RSA block packing and decoding. */
export type RsaEncodingMode = 'fixed-width-numeric' | 'radix' | 'pkcs1-v1_5';

/** Alphabet source for non-PKCS text modes. */
export type RsaAlphabetMode = 'ascii' | 'custom';

/** Worker identifiers used for split range-factor recovery. */
export type RsaRecoverWorkerId = 'balanced' | 'low';

/** Prime-size units reused by RSA prime-generation controls. */
export type RsaPrimeSizeType = PrimeSizeType;

/** Prime-check verdict labels used in RSA validation flows. */
export type RsaFactorCheckVerdict = 'Prime' | 'Probably Prime' | 'Composite';

/** Supported ciphertext display/input formats. */
export type RsaCiphertextFormat = 'decimal' | 'base64' | 'hex';

/** Snapshot of computed RSA key values for UI/state persistence. */
export interface RsaComputedKeySnapshot {
  /** Prime factor `p` serialized as decimal text. */
  p: string;
  /** Prime factor `q` serialized as decimal text. */
  q: string;
  /** Modulus `n = p*q` serialized as decimal text. */
  n: string;
  /** Euler totient `phi(n)` serialized as decimal text. */
  phi: string;
  /** Private exponent `d` serialized as decimal text. */
  d: string;
}

/** Worker request to attempt RSA factor recovery over a range. */
export type RsaDecryptWorkerRequest = {
  /** Worker message discriminator. */
  type: 'recover';
  /** Correlation id for request/response tracking. */
  jobId: number;
  /** Target worker lane (`balanced` or `low`). */
  workerId: RsaRecoverWorkerId;
  /** Target modulus `n` serialized as decimal text. */
  n: string;
  /** Inclusive range start for trial division. */
  start: string;
  /** Optional exclusive range end for bounded scan. */
  endExclusive?: string;
  /** Optional public exponent used to compute private exponent on success. */
  e?: string;
};

/** Worker completion message with recovered factors and derived values. */
export type RsaDecryptCompletedMessage = {
  /** Worker message discriminator. */
  type: 'completed';
  /** Correlation id for request/response tracking. */
  jobId: number;
  /** Worker lane that found the result. */
  workerId: RsaRecoverWorkerId;
  /** Recovered factor `p` serialized as decimal text. */
  p: string;
  /** Recovered factor `q` serialized as decimal text. */
  q: string;
  /** Derived `phi(n)` serialized as decimal text. */
  phi: string;
  /** Derived private exponent `d` serialized as decimal text. */
  d: string;
};

/** Worker heartbeat message emitted during long-running scan attempts. */
export type RsaDecryptHeartbeatMessage = {
  /** Worker message discriminator. */
  type: 'heartbeat';
  /** Correlation id for request/response tracking. */
  jobId: number;
  /** Worker lane reporting progress. */
  workerId: RsaRecoverWorkerId;
  /** Number of divisibility attempts performed so far. */
  attempts: number;
};

/** Worker message indicating no factor pair found in scanned range. */
export type RsaDecryptNotFoundMessage = {
  /** Worker message discriminator. */
  type: 'not_found';
  /** Correlation id for request/response tracking. */
  jobId: number;
  /** Worker lane that completed without finding factors. */
  workerId: RsaRecoverWorkerId;
};

/** Worker error message for recovery failures. */
export type RsaDecryptErrorMessage = {
  /** Worker message discriminator. */
  type: 'error';
  /** Correlation id for request/response tracking. */
  jobId: number;
  /** Worker lane that produced the error. */
  workerId: RsaRecoverWorkerId;
  /** Human-readable error description. */
  message: string;
};

/** Union of all RSA recovery worker response variants. */
export type RsaDecryptWorkerResponse =
  | RsaDecryptHeartbeatMessage
  | RsaDecryptCompletedMessage
  | RsaDecryptNotFoundMessage
  | RsaDecryptErrorMessage;
