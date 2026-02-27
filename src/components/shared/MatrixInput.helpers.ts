import type { MatrixShape } from '../../types';

export type MatrixTextParseMode = 'text' | 'csv' | 'latex';

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

export function matrixValuesToLatexText(values: string[][]): string {
  const rowSeparator = ' \\\\';
  const rows = values
    .map((row) => `  ${row.join(' & ')}`)
    .join(`${rowSeparator}\n`);
  return `$$ \\begin{bmatrix}\n${rows}\n\\end{bmatrix} $$`;
}

export function matrixValuesToMode(
  values: string[][],
  mode: MatrixTextParseMode,
): string {
  if (mode === 'csv') return matrixValuesToCsvText(values);
  if (mode === 'latex') return matrixValuesToLatexText(values);
  return matrixValuesToText(values);
}

function buildParsed(values: string[][]): ParsedMatrixTextInput {
  if (values.length === 0) {
    throw new Error('Matrix text input cannot be empty.');
  }

  const cols = values[0].length;
  if (cols === 0) {
    throw new Error('Matrix text input cannot be empty.');
  }

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

function parseSpaceOrCsvTextByMode(
  text: string,
  mode: 'text' | 'csv',
): ParsedMatrixTextInput {
  const raw = text.replace(/\r/g, '');
  if (raw.trim() === '') {
    throw new Error('Matrix text input cannot be empty.');
  }

  if (mode === 'csv') {
    if (!/^[\d\s,]+$/.test(raw)) {
      throw new Error(
        'CSV matrix input must contain only numbers, commas, and whitespace.',
      );
    }
  } else if (!/^[\d\s]+$/.test(raw)) {
    throw new Error(
      'Text matrix input must contain only numbers and whitespace.',
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

  return buildParsed(values);
}

function stripOptionalLatexDelimiters(text: string): string {
  const trimmed = text.trim();

  const startsWithDouble = trimmed.startsWith('$$');
  const endsWithDouble = trimmed.endsWith('$$');

  if (startsWithDouble !== endsWithDouble) {
    throw new Error(
      'LaTeX matrix input must wrap math mode with matching $$ delimiters.',
    );
  }

  if (startsWithDouble && endsWithDouble) {
    return trimmed.slice(2, -2).trim();
  }

  return trimmed;
}

function parseLatexMatrixText(text: string): ParsedMatrixTextInput {
  const raw = text.replace(/\r/g, '').trim();
  if (raw === '') {
    throw new Error('LaTeX matrix input cannot be empty.');
  }

  const withoutDelimiters = stripOptionalLatexDelimiters(raw);
  const envMatch = withoutDelimiters.match(
    /^\\begin\{bmatrix\}([\s\S]*?)\\end\{bmatrix\}$/,
  );

  if (!envMatch) {
    throw new Error(
      'LaTeX matrix input must be of the form \\begin{bmatrix} ... \\end{bmatrix}.',
    );
  }

  const body = envMatch[1].trim();
  if (body === '') {
    throw new Error('LaTeX matrix body cannot be empty.');
  }

  const rows = body
    .split(/\\\\/)
    .map((row) => row.trim())
    .filter((row) => row.length > 0);

  if (rows.length === 0) {
    throw new Error('LaTeX matrix body cannot be empty.');
  }

  const tokenPattern = /^\d+$/;
  const values = rows.map((row, r) => {
    if (!/^[\d\s&]+$/.test(row)) {
      throw new Error(
        'LaTeX matrix rows must contain only numbers, ampersands, and whitespace.',
      );
    }

    const tokens = row.split('&').map((token) => token.trim());
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

  return buildParsed(values);
}

export function parseMatrixTextByMode(
  text: string,
  mode: MatrixTextParseMode,
): ParsedMatrixTextInput {
  if (mode === 'latex') {
    return parseLatexMatrixText(text);
  }

  return parseSpaceOrCsvTextByMode(text, mode);
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
