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

export interface MatrixShape {
  rows: number;
  cols: number;
}

export type BigIntMatrix = bigint[][];
