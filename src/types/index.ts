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
  method: 'Small Prime Check' | 'Miller-Rabin';
  errorProbabilityExponent?: number;
  compositeReason?: string;
  witness?: bigint;
  rounds?: number;
}

export interface MatrixShape {
  rows: number;
  cols: number;
}

export type BigIntMatrix = bigint[][];
