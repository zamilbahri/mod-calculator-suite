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
  verdict: 'Prime' | 'Composite';
  certaintyPercent: string;
  method: 'Miller-Rabin'; // For now we only have one method, but this allows for adding BPSW.
  rounds?: number;
}

export interface MatrixShape {
  rows: number;
  cols: number;
}

export type BigIntMatrix = bigint[][];
