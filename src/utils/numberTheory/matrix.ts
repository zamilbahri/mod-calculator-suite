import type { BigIntMatrix, Vector } from '../../types';
import { gcd, modInverse, modNormalize } from './core';
import { randomBigIntBelowAny } from './random';

/**
 * Validates modulus input for modular matrix arithmetic.
 *
 * @param {bigint} m - Modulus candidate.
 * @throws {Error} If `m < 2`.
 */
function assertValidModulus(m: bigint): void {
  if (m < 2n) {
    throw new Error('m must be at least 2.');
  }
}

/**
 * Ensures matrix is non-empty and rectangular.
 *
 * @param {BigIntMatrix} matrix - Matrix to validate.
 * @throws {Error} If matrix has zero rows/columns or ragged rows.
 */
function assertRectangular(matrix: BigIntMatrix): void {
  if (matrix.length === 0) {
    throw new Error('Matrix must have at least one row.');
  }
  const cols = matrix[0].length;
  if (cols === 0) {
    throw new Error('Matrix must have at least one column.');
  }
  for (let r = 1; r < matrix.length; r++) {
    if (matrix[r].length !== cols) {
      throw new Error('Matrix rows must all have the same number of columns.');
    }
  }
}

/**
 * Asserts that matrix is square.
 *
 * @param {BigIntMatrix} matrix - Matrix to validate.
 * @throws {Error} If matrix is not square.
 */
export function assertSquare(matrix: BigIntMatrix): void {
  assertRectangular(matrix);
  if (matrix.length !== matrix[0].length) {
    throw new Error('Matrix must be square.');
  }
}

/**
 * Asserts that matrix is invertible modulo `m`.
 *
 * Invertibility is checked using unit-pivot factorization over `Z_m`.
 *
 * @param {BigIntMatrix} matrix - Square matrix candidate.
 * @param {bigint} m - Modulus.
 * @throws {Error} If modulus is invalid, matrix is not square, or not invertible.
 */
export function assertInvertible(matrix: BigIntMatrix, m: bigint): void {
  assertValidModulus(m);
  assertSquare(matrix);
  if (!hasUnitPivotFactorization(matrix, m)) {
    throw new Error('Matrix is not invertible modulo m.');
  }
}

/**
 * Deep-clones a matrix.
 *
 * @param {BigIntMatrix} matrix - Source matrix.
 * @returns {BigIntMatrix} Cloned matrix.
 */
function cloneMatrix(matrix: BigIntMatrix): BigIntMatrix {
  return matrix.map((row) => [...row]);
}

/**
 * Returns a random integer in `[0, limit)`.
 *
 * @param {number} limit - Exclusive upper bound.
 * @returns {number} Random index.
 */
function randomIndex(limit: number): number {
  return Number(randomBigIntBelowAny(BigInt(limit)));
}

/**
 * Samples a random multiplicative unit modulo `m`.
 *
 * @param {bigint} m - Modulus.
 * @returns {bigint} Random `u` with `1 <= u < m` and `gcd(u, m) = 1`.
 */
function randomUnitMod(m: bigint): bigint {
  while (true) {
    const candidate = randomBigIntBelowAny(m);
    if (candidate !== 0n && gcd(candidate, m) === 1n) return candidate;
  }
}

/**
 * Builds the `size x size` identity matrix.
 *
 * @param {number} size - Matrix dimension.
 * @returns {BigIntMatrix} Identity matrix.
 */
export function generateIdentityMatrix(size: number): BigIntMatrix {
  return Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => (r === c ? 1n : 0n)),
  );
}

/**
 * Checks whether matrix admits full unit-pivot elimination modulo `m`.
 *
 * This is used as an invertibility predicate over `Z_m`.
 *
 * @param {BigIntMatrix} matrix - Square matrix.
 * @param {bigint} m - Modulus.
 * @returns {boolean} `true` when invertible modulo `m`.
 */
function hasUnitPivotFactorization(matrix: BigIntMatrix, m: bigint): boolean {
  const n = matrix.length;
  const work = reduceMatrixMod(matrix, m);

  for (let col = 0; col < n; col++) {
    let pivotRow = -1;
    for (let r = col; r < n; r++) {
      const value = work[r][col];
      if (value !== 0n && gcd(value, m) === 1n) {
        pivotRow = r;
        break;
      }
    }

    if (pivotRow === -1) return false;

    if (pivotRow !== col) {
      const temp = work[col];
      work[col] = work[pivotRow];
      work[pivotRow] = temp;
    }

    const invPivot = modInverse(work[col][col], m);
    for (let c = 0; c < n; c++) {
      work[col][c] = modNormalize(work[col][c] * invPivot, m);
    }

    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = work[r][col];
      if (factor === 0n) continue;
      for (let c = 0; c < n; c++) {
        work[r][c] = modNormalize(work[r][c] - factor * work[col][c], m);
      }
    }
  }

  return true;
}

/**
 * Reduces each matrix entry into canonical residue class modulo `m`.
 *
 * @param {BigIntMatrix} matrix - Input matrix.
 * @param {bigint} m - Modulus.
 * @returns {BigIntMatrix} Entry-wise reduced matrix.
 * @throws {Error} If modulus/matrix shape are invalid.
 */
export function reduceMatrixMod(matrix: BigIntMatrix, m: bigint): BigIntMatrix {
  assertValidModulus(m);
  assertRectangular(matrix);
  return matrix.map((row) => row.map((value) => modNormalize(value, m)));
}

/**
 * Computes exact integer determinant using fraction-free elimination.
 *
 * @param {BigIntMatrix} matrix - Square integer matrix.
 * @returns {bigint} Exact determinant over integers.
 * @throws {Error} If matrix is not square.
 */
function determinantInteger(matrix: BigIntMatrix): bigint {
  assertSquare(matrix);
  const n = matrix.length;
  if (n === 1) return matrix[0][0];

  const a = cloneMatrix(matrix);
  let sign = 1n;
  let prevPivot = 1n;

  for (let k = 0; k < n - 1; k++) {
    let pivotRow = k;
    while (pivotRow < n && a[pivotRow][k] === 0n) {
      pivotRow++;
    }

    if (pivotRow === n) return 0n;

    if (pivotRow !== k) {
      const temp = a[k];
      a[k] = a[pivotRow];
      a[pivotRow] = temp;
      sign = -sign;
    }

    const pivot = a[k][k];

    for (let i = k + 1; i < n; i++) {
      for (let j = k + 1; j < n; j++) {
        a[i][j] = (pivot * a[i][j] - a[i][k] * a[k][j]) / prevPivot;
      }
      a[i][k] = 0n;
    }

    prevPivot = pivot;
  }

  return sign * a[n - 1][n - 1];
}

/**
 * Computes determinant reduced modulo `m`.
 *
 * @param {BigIntMatrix} matrix - Square matrix.
 * @param {bigint} m - Modulus.
 * @returns {bigint} `det(matrix) mod m` in `[0, m-1]`.
 * @throws {Error} If modulus is invalid or matrix is not square.
 */
export function determinantMod(matrix: BigIntMatrix, m: bigint): bigint {
  assertValidModulus(m);
  const det = determinantInteger(matrix);
  return modNormalize(det, m);
}

export interface MatrixRrefModResult {
  /** Reduced row-echelon matrix modulo `m`. */
  matrix: BigIntMatrix;
  /** Number of pivots discovered. */
  rank: number;
  /** Zero-based pivot column indices. */
  pivotColumns: number[];
}

/**
 * Computes modular row-reduced echelon form using unit pivots only.
 *
 * Over composite moduli, non-unit pivots are skipped.
 *
 * @param {BigIntMatrix} matrix - Input matrix.
 * @param {bigint} m - Modulus.
 * @returns {MatrixRrefModResult} Reduced matrix, rank, and pivot metadata.
 * @throws {Error} If modulus or matrix shape is invalid.
 */
export function rrefMatrixMod(
  matrix: BigIntMatrix,
  m: bigint,
): MatrixRrefModResult {
  assertValidModulus(m);
  assertRectangular(matrix);

  const out = reduceMatrixMod(matrix, m);
  const rows = out.length;
  const cols = out[0].length;
  const pivotColumns: number[] = [];

  let pivotRow = 0;

  for (let col = 0; col < cols && pivotRow < rows; col++) {
    let rowWithUnitPivot = -1;
    for (let r = pivotRow; r < rows; r++) {
      const value = out[r][col];
      if (value !== 0n && gcd(value, m) === 1n) {
        rowWithUnitPivot = r;
        break;
      }
    }

    if (rowWithUnitPivot === -1) {
      continue;
    }

    if (rowWithUnitPivot !== pivotRow) {
      const temp = out[pivotRow];
      out[pivotRow] = out[rowWithUnitPivot];
      out[rowWithUnitPivot] = temp;
    }

    const pivotValue = out[pivotRow][col];
    const invPivot = modInverse(pivotValue, m);
    for (let c = 0; c < cols; c++) {
      out[pivotRow][c] = modNormalize(out[pivotRow][c] * invPivot, m);
    }

    for (let r = 0; r < rows; r++) {
      if (r === pivotRow) continue;
      const factor = out[r][col];
      if (factor === 0n) continue;
      for (let c = 0; c < cols; c++) {
        out[r][c] = modNormalize(out[r][c] - factor * out[pivotRow][c], m);
      }
    }

    pivotColumns.push(col);
    pivotRow++;
  }

  return {
    matrix: out,
    rank: pivotColumns.length,
    pivotColumns,
  };
}

/**
 * Computes modular matrix inverse via Gauss-Jordan elimination.
 *
 * @param {BigIntMatrix} matrix - Square matrix.
 * @param {bigint} m - Modulus.
 * @returns {BigIntMatrix} Inverse matrix modulo `m`.
 * @throws {Error} If modulus is invalid, matrix is not square, or not invertible.
 */
export function inverseMatrixMod(
  matrix: BigIntMatrix,
  m: bigint,
): BigIntMatrix {
  assertValidModulus(m);
  assertSquare(matrix);
  assertInvertible(matrix, m);
  const n = matrix.length;

  const left = reduceMatrixMod(matrix, m);
  const right: BigIntMatrix = generateIdentityMatrix(n);

  for (let col = 0; col < n; col++) {
    let pivotRow = -1;
    let invPivot = 0n;
    for (let r = col; r < n; r++) {
      const value = left[r][col];
      if (value === 0n) continue;
      try {
        invPivot = modInverse(value, m);
        pivotRow = r;
        break;
      } catch {
        // Not a unit modulo m; try the next candidate row.
      }
    }

    if (pivotRow === -1) {
      throw new Error('Matrix is not invertible modulo m.');
    }

    if (pivotRow !== col) {
      const leftTemp = left[col];
      left[col] = left[pivotRow];
      left[pivotRow] = leftTemp;

      const rightTemp = right[col];
      right[col] = right[pivotRow];
      right[pivotRow] = rightTemp;
    }

    if (pivotRow !== col) {
      invPivot = modInverse(left[col][col], m);
    }
    for (let c = 0; c < n; c++) {
      left[col][c] = modNormalize(left[col][c] * invPivot, m);
      right[col][c] = modNormalize(right[col][c] * invPivot, m);
    }

    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = left[r][col];
      if (factor === 0n) continue;
      for (let c = 0; c < n; c++) {
        left[r][c] = modNormalize(left[r][c] - factor * left[col][c], m);
        right[r][c] = modNormalize(right[r][c] - factor * right[col][c], m);
      }
    }
  }

  return right;
}

/**
 * Multiplies two matrices modulo `m`.
 *
 * @param {BigIntMatrix} left - Left matrix.
 * @param {BigIntMatrix} right - Right matrix.
 * @param {bigint} m - Modulus.
 * @returns {BigIntMatrix} Product matrix modulo `m`.
 */
export function multiplyMatrixMod(
  left: BigIntMatrix,
  right: BigIntMatrix,
  m: bigint,
): BigIntMatrix;
/**
 * Multiplies a matrix by a vector modulo `m`.
 *
 * @param {BigIntMatrix} left - Left matrix.
 * @param {Vector} right - Right vector.
 * @param {bigint} m - Modulus.
 * @returns {Vector} Product vector modulo `m`.
 */
export function multiplyMatrixMod(
  left: BigIntMatrix,
  right: Vector,
  m: bigint,
): Vector;
/**
 * Multiplies matrix-matrix or matrix-vector operands modulo `m`.
 *
 * @param {BigIntMatrix} left - Left matrix.
 * @param {BigIntMatrix | Vector} right - Right operand.
 * @param {bigint} m - Modulus.
 * @returns {BigIntMatrix | Vector} Product modulo `m`.
 * @throws {Error} If modulus/shape/dimensions are invalid.
 */
export function multiplyMatrixMod(
  left: BigIntMatrix,
  right: BigIntMatrix | Vector,
  m: bigint,
): BigIntMatrix | Vector {
  assertValidModulus(m);
  assertRectangular(left);

  const leftRows = left.length;
  const leftCols = left[0].length;

  if (right.length === 0) {
    throw new Error('Right operand must not be empty.');
  }

  if (Array.isArray(right[0])) {
    const rightMatrix = right as BigIntMatrix;
    assertRectangular(rightMatrix);
    const rightRows = rightMatrix.length;
    const rightCols = rightMatrix[0].length;

    if (leftCols !== rightRows) {
      throw new Error('Incompatible dimensions for matrix multiplication.');
    }

    const out: BigIntMatrix = Array.from({ length: leftRows }, () =>
      Array.from({ length: rightCols }, () => 0n),
    );

    for (let r = 0; r < leftRows; r++) {
      for (let c = 0; c < rightCols; c++) {
        let acc = 0n;
        for (let k = 0; k < leftCols; k++) {
          acc += left[r][k] * rightMatrix[k][c];
        }
        out[r][c] = modNormalize(acc, m);
      }
    }

    return out;
  }

  const rightVector = right as Vector;
  if (leftCols !== rightVector.length) {
    throw new Error(
      'Incompatible dimensions for matrix-vector multiplication.',
    );
  }

  const out: Vector = Array.from({ length: leftRows }, () => 0n);
  for (let r = 0; r < leftRows; r++) {
    let acc = 0n;
    for (let k = 0; k < leftCols; k++) {
      acc += left[r][k] * rightVector[k];
    }
    out[r] = modNormalize(acc, m);
  }
  return out;
}

/**
 * Generates a random invertible `size x size` matrix modulo `m`.
 *
 * Approach:
 * starts from the identity matrix and applies randomized invertibility-preserving
 * row operations, which is equivalent to Gaussian elimination in reverse.
 *
 * For mixing/density, it performs `max(20, 2 * size * size)` rounds and at each
 * round chooses one operation:
 * - swap two rows,
 * - scale one row by a unit modulo `m`,
 * - add a non-zero multiple of one row to another row.
 *
 * This guarantees the output remains invertible modulo `m` because each step is
 * an elementary row operation with an invertible transformation.
 *
 * @param {number} size - Matrix dimension (must be a positive integer).
 * @param {bigint} m - Modulus (must be at least 2).
 * @returns {BigIntMatrix} Random invertible matrix over `Z_m`.
 * @throws {Error} If `size` is not a positive integer or if `m < 2`.
 */
export function generateRandomInvertibleMatrixMod(
  size: number,
  m: bigint,
): BigIntMatrix {
  assertValidModulus(m);
  if (!Number.isInteger(size) || size < 1) {
    throw new Error('size must be a positive integer.');
  }

  const matrix: BigIntMatrix = generateIdentityMatrix(size);

  // Scale rounds quadratically to ensure matrix density for larger sizes.
  const rounds = Math.max(20, size * size * 2);

  for (let i = 0; i < rounds; i++) {
    // Bias heavily toward row additions to fill zeros.
    // randomIndex(10) gives values 0-9.
    // 0 = Swap (10%), 1 = Scale (10%), 2-9 = Add (80%)
    const op = randomIndex(10);

    if (op === 0) {
      // Swap two rows.
      const r1 = randomIndex(size);
      let r2 = randomIndex(size);
      while (r2 === r1) r2 = randomIndex(size);
      const temp = matrix[r1];
      matrix[r1] = matrix[r2];
      matrix[r2] = temp;
      continue;
    }

    if (op === 1) {
      // Scale a row by a unit modulo m.
      const row = randomIndex(size);
      const scale = randomUnitMod(m);
      for (let c = 0; c < size; c++) {
        matrix[row][c] = modNormalize(matrix[row][c] * scale, m);
      }
      continue;
    }

    // Add a random multiple of one row to another row.
    const src = randomIndex(size);
    let dst = randomIndex(size);
    while (dst === src) dst = randomIndex(size);

    let coeff = randomBigIntBelowAny(m);
    while (coeff === 0n) coeff = randomBigIntBelowAny(m);

    for (let c = 0; c < size; c++) {
      matrix[dst][c] = modNormalize(matrix[dst][c] + coeff * matrix[src][c], m);
    }
  }

  return matrix;
}
