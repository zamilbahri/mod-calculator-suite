/**
 * Shared number-theory type definitions.
 *
 * Covers core arithmetic results, CRT shapes, primality options/results,
 * prime-generation policies, worker protocol messages, and matrix helpers.
 */

/** Extended Euclidean algorithm result (`a*x + b*y = gcd`). */
export interface EGCDResult {
  /** Greatest common divisor of inputs. */
  gcd: bigint;
  /** Bezout coefficient for the first input. */
  x: bigint;
  /** Bezout coefficient for the second input. */
  y: bigint;
}

/** User-entered CRT equation before strict numeric parsing. */
export interface CRTEquationDraft {
  /** Raw residue input. */
  a: string;
  /** Raw modulus input. */
  m: string;
}

/** Parsed CRT equation using bigint operands. */
export interface CRTEquationParsed {
  /** Residue in `x ≡ a (mod m)`. */
  a: bigint;
  /** Modulus in `x ≡ a (mod m)`. */
  m: bigint;
}

/** CRT solution pair (`x mod M`). */
export interface CRTSolution {
  /** Canonical solution representative. */
  x: bigint;
  /** Combined modulus. */
  M: bigint;
}

/** Structured primality check result. */
export interface PrimalityCheckResult {
  /** Boolean primality outcome. */
  isProbablePrime: boolean;
  /** Human-readable verdict. */
  verdict: 'Prime' | 'Probably Prime' | 'Composite';
  /** Method that produced the verdict. */
  method: 'Small Prime Check' | 'Baillie-PSW' | 'Miller-Rabin';
  /** Exponent `k` in an approximate `2^-k` error bound. */
  errorProbabilityExponent?: number;
  /** Explanation when classified as composite. */
  compositeReason?: string;
  /** Miller-Rabin witness when available. */
  witness?: bigint;
  /** Number of probabilistic rounds used. */
  rounds?: number;
}

/** Supported primality-testing strategies. */
export type PrimalityMethodSelection = 'Auto' | 'Miller-Rabin' | 'Baillie-PSW';

/** Optional settings for primality checks. */
export interface PrimalityCheckOptions {
  /** Method selection override. */
  method?: PrimalityMethodSelection;
  /** Round count when Miller-Rabin is used. */
  millerRabinRounds?: number;
}

/** Prime-size unit for generation requests. */
export type PrimeSizeType = 'digits' | 'bits';

/** Prime generation request options. */
export interface PrimeGenerationOptions {
  /** Target prime size in selected unit. */
  size: number;
  /** Size unit (`digits` or `bits`). */
  sizeType: PrimeSizeType;
  /** Number of primes to generate. */
  count?: number;
  /** Primality method selection. */
  method?: PrimalityMethodSelection;
  /** Miller-Rabin rounds. */
  millerRabinRounds?: number;
}

/** Size-dependent generation limit policy. */
export interface PrimeGenerationCountPolicy {
  /** Maximum bit size covered by this policy bucket. */
  maxBits: number;
  /** Maximum request count allowed in this bucket. */
  maxCount: number;
  /** UI warning threshold for expensive requests. */
  warnAt: number;
}

/** Worker request message to generate one prime-generation job. */
export type PrimeGeneratorWorkerRequest = {
  /** Worker message discriminator. */
  type: 'generate';
  /** Correlation id for request/response tracking. */
  jobId: number;
  /** Prime generation options. */
  options: PrimeGenerationOptions;
};

/** Worker progress event for completed prime count. */
export type PrimeGeneratorWorkerProgressMessage = {
  /** Worker message discriminator. */
  type: 'progress';
  /** Request correlation id. */
  jobId: number;
  /** Number of primes completed so far. */
  completed: number;
  /** Total number requested. */
  total: number;
  /** Newly generated prime serialized as decimal string. */
  prime: string;
};

/** Worker heartbeat event emitted during long-running attempts. */
export type PrimeGeneratorWorkerHeartbeatMessage = {
  /** Worker message discriminator. */
  type: 'heartbeat';
  /** Request correlation id. */
  jobId: number;
  /** 1-based index of the prime currently being searched. */
  primeIndex: number;
  /** Total primes requested. */
  total: number;
  /** Attempt count for current prime. */
  attempts: number;
};

/** Worker completion event with elapsed time and generated primes. */
export type PrimeGeneratorWorkerCompletedMessage = {
  /** Worker message discriminator. */
  type: 'completed';
  /** Request correlation id. */
  jobId: number;
  /** Total job duration in milliseconds. */
  elapsedMs: number;
  /** Generated primes serialized as decimal strings. */
  primes: string[];
};

/** Worker error event. */
export type PrimeGeneratorWorkerErrorMessage = {
  /** Worker message discriminator. */
  type: 'error';
  /** Request correlation id. */
  jobId: number;
  /** Human-readable failure message. */
  message: string;
};

/** Union of all worker response message variants. */
export type PrimeGeneratorWorkerResponse =
  | PrimeGeneratorWorkerProgressMessage
  | PrimeGeneratorWorkerHeartbeatMessage
  | PrimeGeneratorWorkerCompletedMessage
  | PrimeGeneratorWorkerErrorMessage;

/** Matrix dimension descriptor. */
export interface MatrixShape {
  /** Number of rows. */
  rows: number;
  /** Number of columns. */
  cols: number;
}

/** Bigint matrix representation. */
export type BigIntMatrix = bigint[][];

/** Bigint vector representation. */
export type Vector = bigint[];
