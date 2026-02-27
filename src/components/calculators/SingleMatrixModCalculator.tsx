import React, { useMemo, useState } from 'react';
import MathText from '../shared/MathText';
import MatrixInput from '../shared/MatrixInput';
import NumericInput from '../shared/NumericInput';
import MatrixOutput from '../shared/MatrixOutput';
import NumericOutput from '../shared/NumericOutput';
import {
  errorBoxClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../shared/ui';
import {
  determinantMod,
  inverseMatrixMod,
  matrixToString,
  parseMatrixInput,
  parseBigIntStrict,
  reduceMatrixMod,
  rrefMatrixMod,
} from '../../utils/numberTheory';
import type { MatrixShape } from '../../types';

const DEFAULT_MODULUS = '67'; // 67 is prime :D

function createMatrixFromCsv(csvText: string): string[][] {
  const lines = csvText
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '');
  return lines.map((line) => line.split(',').map((token) => token.trim()));
}

function parseModulus(input: string): bigint {
  const parsed = parseBigIntStrict(input, 'm');
  if (parsed < 2n) throw new Error('m must be at least 2.');
  return parsed;
}

const SingleMatrixModCalculator: React.FC = () => {
  const defaultShape: MatrixShape = { rows: 3, cols: 3 };
  const defaultMatrixCsv = `1,2,3\n4,5,6\n7,8,9`;
  const defaultMatrix = createMatrixFromCsv(defaultMatrixCsv);

  const [shape, setShape] = useState<MatrixShape>(defaultShape);
  const [modulus, setModulus] = useState(DEFAULT_MODULUS);
  const [matrixInput, setMatrixInput] = useState<string[][]>(defaultMatrix);
  const [matrixInputError, setMatrixInputError] = useState('');

  const [workingAction, setWorkingAction] = useState<
    'det' | 'rref' | 'inv' | null
  >(null);
  const [actionError, setActionError] = useState<string>('');
  const [determinant, setDeterminant] = useState<string>('');
  const [rref, setRref] = useState<string>('');
  const [inverse, setInverse] = useState<string>('');

  const parsedInput = useMemo(() => {
    try {
      const m = parseModulus(modulus);
      const matrix = parseMatrixInput(matrixInput, 'A');
      return { matrix, m, error: '' };
    } catch (e) {
      return {
        matrix: null,
        m: null,
        error: e instanceof Error ? e.message : 'Invalid matrix input.',
      };
    }
  }, [modulus, matrixInput]);

  const combinedInputError = matrixInputError || parsedInput.error;
  const modulusLabel = modulus.trim() === '' ? 'm' : modulus.trim();

  const reducedView = useMemo(() => {
    if (!parsedInput.matrix || !parsedInput.m) return '';
    return matrixToString(reduceMatrixMod(parsedInput.matrix, parsedInput.m));
  }, [parsedInput]);

  const clearComputedOutputs = () => {
    setActionError('');
    setDeterminant('');
    setRref('');
    setInverse('');
  };

  const computeDeterminant = async () => {
    setActionError('');
    setDeterminant('');
    if (!parsedInput.matrix || !parsedInput.m) {
      setActionError(combinedInputError || 'Invalid input.');
      return;
    }
    if (shape.rows !== shape.cols) {
      setActionError('Determinant requires a square matrix.');
      return;
    }

    setWorkingAction('det');
    try {
      await new Promise((resolve) => setTimeout(resolve, 0));
      const det = determinantMod(parsedInput.matrix, parsedInput.m);
      setDeterminant(det.toString());
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : 'Failed to compute determinant.',
      );
    } finally {
      setWorkingAction(null);
    }
  };

  const computeRref = async () => {
    setActionError('');
    setRref('');
    if (!parsedInput.matrix || !parsedInput.m) {
      setActionError(combinedInputError || 'Invalid input.');
      return;
    }

    setWorkingAction('rref');
    try {
      await new Promise((resolve) => setTimeout(resolve, 0));
      const result = rrefMatrixMod(parsedInput.matrix, parsedInput.m);
      setRref(matrixToString(result.matrix));
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : 'Failed to compute RREF.',
      );
    } finally {
      setWorkingAction(null);
    }
  };

  const computeInverse = async () => {
    setActionError('');
    setInverse('');
    if (!parsedInput.matrix || !parsedInput.m) {
      setActionError(combinedInputError || 'Invalid input.');
      return;
    }
    if (shape.rows !== shape.cols) {
      setActionError('Inverse requires a square matrix.');
      return;
    }

    setWorkingAction('inv');
    try {
      await new Promise((resolve) => setTimeout(resolve, 0));
      const inv = inverseMatrixMod(parsedInput.matrix, parsedInput.m);
      setInverse(matrixToString(inv));
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : 'Failed to compute inverse matrix.',
      );
    } finally {
      setWorkingAction(null);
    }
  };

  const clearAll = () => {
    setShape(defaultShape);
    setModulus(DEFAULT_MODULUS);
    const fresh = createMatrixFromCsv(defaultMatrixCsv);
    setMatrixInput(fresh);
    setMatrixInputError('');
    clearComputedOutputs();
  };

  const disableActions = workingAction !== null;

  return (
    <div>
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
              clearComputedOutputs();
            }}
            minRows={1}
            rows={1}
            placeholder="modulus >= 2"
          />
        </div>

        <MatrixInput
          matrixSymbol="A"
          modulusLabel={modulusLabel}
          values={matrixInput}
          minSize={1}
          maxSize={10}
          onInputErrorChange={(message) => {
            setMatrixInputError(message);
            clearComputedOutputs();
          }}
          onShapeChange={(nextShape, resizedValues) => {
            setShape(nextShape);
            setMatrixInput(resizedValues);
            clearComputedOutputs();
          }}
          onValuesChange={(nextValues) => {
            setMatrixInput(nextValues);
            clearComputedOutputs();
          }}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 pb-1">
        <button
          type="button"
          onClick={computeDeterminant}
          disabled={disableActions}
          className={primaryButtonClass}
        >
          {workingAction === 'det' ? (
            'Computing…'
          ) : (
            <MathText>{`\\det(A)`}</MathText>
          )}
        </button>
        <button
          type="button"
          onClick={computeRref}
          disabled={disableActions}
          className={primaryButtonClass}
        >
          {workingAction === 'rref' ? (
            'Computing…'
          ) : (
            <MathText>{`\\operatorname{RREF}(A)`}</MathText>
          )}
        </button>
        <button
          type="button"
          onClick={computeInverse}
          disabled={disableActions}
          className={primaryButtonClass}
        >
          {workingAction === 'inv' ? (
            'Computing…'
          ) : (
            <MathText>{`A^{-1}`}</MathText>
          )}
        </button>
        <button
          type="button"
          onClick={clearAll}
          className={secondaryButtonClass}
        >
          Clear
        </button>
      </div>

      {actionError ? <div className={errorBoxClass}>{actionError}</div> : null}

      {!combinedInputError && reducedView ? (
        <div className="mt-6 space-y-4">
          <MatrixOutput
            label={<MathText>{`A \\bmod m`}</MathText>}
            value={reducedView}
          />
        </div>
      ) : null}

      {determinant ? (
        <div className="mt-4">
          <NumericOutput
            label={<MathText>{`\\det(A) \\bmod m`}</MathText>}
            value={determinant}
          />
        </div>
      ) : null}

      {rref ? (
        <div className="mt-4">
          <MatrixOutput
            label={<MathText>{`\\operatorname{RREF}(A) \\bmod m`}</MathText>}
            value={rref}
          />
        </div>
      ) : null}

      {inverse ? (
        <div className="mt-4">
          <MatrixOutput
            label={<MathText>{`A^{-1} \\bmod m`}</MathText>}
            value={inverse}
          />
        </div>
      ) : null}
    </div>
  );
};

export default SingleMatrixModCalculator;

