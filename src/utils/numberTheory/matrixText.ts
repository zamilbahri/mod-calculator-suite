import type { BigIntMatrix } from '../../types';

/**
 * Parses a matrix of string entries into a bigint matrix.
 *
 * Entries must be unsigned base-10 integers.
 *
 * @param {string[][]} matrix - Matrix entries from UI input.
 * @param {string} matrixSymbol - Symbol used in validation labels (for example, `A`).
 * @returns {BigIntMatrix} Parsed bigint matrix.
 * @throws {Error} If matrix shape is invalid or any entry is not an integer.
 */
export function parseMatrixInput(
  matrix: string[][],
  matrixSymbol = 'A',
): BigIntMatrix {
  if (matrix.length === 0) {
    throw new Error('Matrix must have at least one row.');
  }
  const expectedCols = matrix[0].length;
  if (expectedCols === 0) {
    throw new Error('Matrix must have at least one column.');
  }

  const out: BigIntMatrix = [];
  for (let r = 0; r < matrix.length; r++) {
    if (matrix[r].length !== expectedCols) {
      throw new Error('Matrix rows must all have the same number of columns.');
    }

    const row: bigint[] = [];
    for (let c = 0; c < matrix[r].length; c++) {
      const value = matrix[r][c].trim();
      const label = `${matrixSymbol}[${r + 1},${c + 1}]`;
      if (value === '') {
        throw new Error(`${label} must be an integer.`);
      }
      if (!/^\d+$/.test(value)) {
        throw new Error(`${label} must be an integer.`);
      }
      row.push(BigInt(value));
    }
    out.push(row);
  }

  return out;
}

/**
 * Serializes a bigint matrix into a line-based text block.
 *
 * Rows are separated by newlines and entries by spaces.
 *
 * @param {BigIntMatrix} matrix - Matrix to serialize.
 * @returns {string} Matrix text representation.
 */
export function matrixToString(matrix: BigIntMatrix): string {
  return matrix
    .map((row) => `${row.map((value) => value.toString()).join(' ')}`)
    .join('\n');
}

