export interface EGCDResult {
  gcd: bigint;
  x: bigint;
  y: bigint;
}

export interface CRTEquationDraft {
  a: string;
  m: string;
}

export interface CRTEquationParsed {
  a: bigint;
  m: bigint;
}

export interface CRTSolution {
  x: bigint;
  M: bigint;
}

export interface PrimalityCheckResult {
  isProbablePrime: boolean;
  verdict: 'Prime' | 'Probably Prime' | 'Composite';
  method: 'Small Prime Check' | 'Baillie-PSW' | 'Miller-Rabin';
  errorProbabilityExponent?: number;
  compositeReason?: string;
  witness?: bigint;
  rounds?: number;
}

export type PrimalityMethodSelection = 'Auto' | 'Miller-Rabin' | 'Baillie-PSW';

export interface PrimalityCheckOptions {
  method?: PrimalityMethodSelection;
  millerRabinRounds?: number;
}

export type PrimeSizeType = 'digits' | 'bits';

export interface PrimeGenerationOptions {
  size: number;
  sizeType: PrimeSizeType;
  count?: number;
  method?: PrimalityMethodSelection;
  millerRabinRounds?: number;
}

export interface PrimeGenerationCountPolicy {
  maxBits: number;
  maxCount: number;
  warnAt: number;
}

export type PrimeGeneratorWorkerGenerateRequest = {
  type: 'generate';
  jobId: number;
  options: PrimeGenerationOptions;
};

export type PrimeGeneratorWorkerRequest = PrimeGeneratorWorkerGenerateRequest;

export type PrimeGeneratorWorkerProgressMessage = {
  type: 'progress';
  jobId: number;
  completed: number;
  total: number;
  prime: string;
};

export type PrimeGeneratorWorkerHeartbeatMessage = {
  type: 'heartbeat';
  jobId: number;
  primeIndex: number;
  total: number;
  attempts: number;
};

export type PrimeGeneratorWorkerCompletedMessage = {
  type: 'completed';
  jobId: number;
  elapsedMs: number;
  primes: string[];
};

export type PrimeGeneratorWorkerErrorMessage = {
  type: 'error';
  jobId: number;
  message: string;
};

export type PrimeGeneratorWorkerResponse =
  | PrimeGeneratorWorkerProgressMessage
  | PrimeGeneratorWorkerHeartbeatMessage
  | PrimeGeneratorWorkerCompletedMessage
  | PrimeGeneratorWorkerErrorMessage;

export interface MatrixShape {
  rows: number;
  cols: number;
}

export type BigIntMatrix = bigint[][];
