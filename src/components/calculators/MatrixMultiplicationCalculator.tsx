import React, { useMemo, useState } from 'react';
import MathText from '../shared/MathText';
import MatrixInput from '../shared/MatrixInput';
import NumericInput from '../shared/NumericInput';
import MatrixOutput from '../shared/MatrixOutput';
import {
  errorBoxClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../shared/ui';
import {
  matrixToString,
  multiplyMatrixMod,
  parseMatrixInput,
  parseBigIntStrict,
} from '../../utils/numberTheory';

const DEFAULT_MODULUS = '67'; // 67 is prime :D

function createMatrix(rows: number, cols: number, seed?: number[]): string[][] {
  let idx = 0;
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => {
      if (!seed || idx >= seed.length) return '0';
      return String(seed[idx++]);
    }),
  );
}

const MatrixMultiplicationCalculator: React.FC = () => {
  const [matrixA, setMatrixA] = useState<string[][]>(
    createMatrix(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]),
  );
  const [matrixB, setMatrixB] = useState<string[][]>(
    createMatrix(3, 3, [9, 8, 7, 6, 5, 4, 3, 2, 1]),
  );
  const [modulus, setModulus] = useState(DEFAULT_MODULUS);

  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [matrixAInputError, setMatrixAInputError] = useState('');
  const [matrixBInputError, setMatrixBInputError] = useState('');
  const [result, setResult] = useState('');

  const compute = async () => {
    setError('');
    setResult('');

    try {
      if (matrixAInputError || matrixBInputError) {
        throw new Error('Fix matrix input format before computing.');
      }

      setWorking(true);
      await new Promise((resolve) => setTimeout(resolve, 0));

      const m = parseBigIntStrict(modulus, 'm');
      if (m < 2n) throw new Error('m must be at least 2.');

      const A = parseMatrixInput(matrixA, 'A');
      const B = parseMatrixInput(matrixB, 'B');
      const C = multiplyMatrixMod(A, B, m);
      setResult(matrixToString(C));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to compute A·B mod m.');
    } finally {
      setWorking(false);
    }
  };

  const clear = () => {
    setMatrixA(createMatrix(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]));
    setMatrixB(createMatrix(3, 3, [9, 8, 7, 6, 5, 4, 3, 2, 1]));
    setModulus(DEFAULT_MODULUS);
    setMatrixAInputError('');
    setMatrixBInputError('');
    setError('');
    setResult('');
  };

  const resultLabel = useMemo(() => {
    const mLabel = modulus.trim() === '' ? 'm' : modulus.trim();
    return <MathText>{`A \\cdot B \\bmod ${mLabel}`}</MathText>;
  }, [modulus]);

  return (
    <div>
      <div className="mb-4">
        <NumericInput
          label={
            <span className="flex items-center gap-1">
              <span>Modulus</span>
              <MathText>m</MathText>
            </span>
          }
          value={modulus}
          onChange={(next) => {
            setModulus(next);
            setResult('');
            setError('');
          }}
          minRows={1}
          rows={1}
          placeholder="modulus >= 2"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MatrixInput
          matrixSymbol="A"
          modulusLabel={modulus.trim() === '' ? 'm' : modulus.trim()}
          values={matrixA}
          minSize={1}
          maxSize={10}
          onInputErrorChange={(message) => {
            setMatrixAInputError(message);
            setResult('');
            setError('');
          }}
          onShapeChange={(_nextShape, resizedValues) => {
            setMatrixA(resizedValues);
            setResult('');
            setError('');
          }}
          onValuesChange={(nextValues) => {
            setMatrixA(nextValues);
            setResult('');
            setError('');
          }}
        />

        <MatrixInput
          matrixSymbol="B"
          modulusLabel={modulus.trim() === '' ? 'm' : modulus.trim()}
          values={matrixB}
          minSize={1}
          maxSize={10}
          onInputErrorChange={(message) => {
            setMatrixBInputError(message);
            setResult('');
            setError('');
          }}
          onShapeChange={(_nextShape, resizedValues) => {
            setMatrixB(resizedValues);
            setResult('');
            setError('');
          }}
          onValuesChange={(nextValues) => {
            setMatrixB(nextValues);
            setResult('');
            setError('');
          }}
        />
      </div>

      <div className="mt-4 flex items-center gap-3 pb-1">
        <button
          type="button"
          onClick={compute}
          disabled={working}
          className={primaryButtonClass}
        >
          {working ? 'Computing…' : <MathText>{`A \\cdot B`}</MathText>}
        </button>
        <button type="button" onClick={clear} className={secondaryButtonClass}>
          Clear
        </button>
      </div>

      {error ? <div className={errorBoxClass}>{error}</div> : null}

      {result ? (
        <div className="mt-6">
          <MatrixOutput label={resultLabel} value={result} />
        </div>
      ) : null}
    </div>
  );
};

export default MatrixMultiplicationCalculator;

