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

export interface MatrixShape {
  rows: number;
  cols: number;
}

export type BigIntMatrix = bigint[][];
