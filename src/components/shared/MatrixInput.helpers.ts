import type { MatrixShape } from '../../types';

export type MatrixTextParseMode = 'space' | 'csv';

export interface ParsedMatrixTextInput {
  shape: MatrixShape;
  values: string[][];
}

export function matrixValuesToText(values: string[][]): string {
  return values.map((row) => row.join(' ')).join('\n');
}

export function matrixValuesToCsvText(values: string[][]): string {
  return values.map((row) => row.join(',')).join('\n');
}

export function parseMatrixTextByMode(
  text: string,
  mode: MatrixTextParseMode,
): ParsedMatrixTextInput {
  const raw = text.replace(/\r/g, '');
  if (raw.trim() === '') {
    throw new Error('Matrix text input cannot be empty.');
  }

  if (!/^[\d\s,]+$/.test(raw)) {
    throw new Error(
      'Matrix text input must contain only numbers, commas, and whitespace.',
    );
  }

  const lines = raw.split('\n').filter((line) => line.trim() !== '');
  const tokenPattern = /^\d+$/;

  const values = lines.map((line, r) => {
    const tokens =
      mode === 'csv'
        ? line.replace(/\s+/g, '').split(',')
        : line.trim().split(/\s+/);
    if (tokens.length === 0) {
      throw new Error(`Row ${r + 1} cannot be empty.`);
    }
    for (let c = 0; c < tokens.length; c++) {
      if (!tokenPattern.test(tokens[c])) {
        throw new Error(`A[${r + 1},${c + 1}] must be an integer.`);
      }
    }
    return tokens;
  });

  const cols = values[0].length;
  for (let r = 1; r < values.length; r++) {
    if (values[r].length !== cols) {
      throw new Error(
        'All rows in matrix text input must have the same length.',
      );
    }
  }

  return {
    shape: { rows: values.length, cols },
    values,
  };
}

export function parseStrictMatrixTextInput(
  text: string,
  minSize: number,
  maxSize: number,
  mode: MatrixTextParseMode,
): ParsedMatrixTextInput {
  const parsed = parseMatrixTextByMode(text, mode);
  if (
    parsed.shape.rows < minSize ||
    parsed.shape.rows > maxSize ||
    parsed.shape.cols < minSize ||
    parsed.shape.cols > maxSize
  ) {
    throw new Error(
      `Matrix dimensions must be between ${minSize} and ${maxSize}.`,
    );
  }
  return parsed;
}

