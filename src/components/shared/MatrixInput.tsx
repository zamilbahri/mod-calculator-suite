import React, { useState } from 'react';
import type { MatrixShape } from '../../types';
import MathText from './MathText';
import ToggleGroup from './ToggleGroup';
import CopyButton from './CopyButton';
import type { MatrixTextParseMode } from './MatrixInput.helpers';
import {
  matrixValuesToCsvText,
  matrixValuesToMode,
  parseMatrixTextByMode,
  parseStrictMatrixTextInput,
} from './MatrixInput.helpers';
import { inputClass, labelClass } from './ui';

export interface MatrixInputProps {
  matrixSymbol: string;
  modulusLabel: string;
  values: string[][];
  onShapeChange: (shape: MatrixShape, resizedValues: string[][]) => void;
  onValuesChange: (values: string[][]) => void;
  minSize?: number;
  maxSize?: number;
  onInputErrorChange?: (message: string) => void;
}

const MatrixInput: React.FC<MatrixInputProps> = ({
  matrixSymbol,
  modulusLabel,
  values,
  onShapeChange,
  onValuesChange,
  minSize = 1,
  maxSize = 10,
  onInputErrorChange,
}) => {
  const [parseMode, setParseMode] = useState<MatrixTextParseMode>('csv');
  const [matrixText, setMatrixText] = useState(() =>
    matrixValuesToCsvText(values),
  );

  const applyTextInput = (nextText: string, mode: MatrixTextParseMode) => {
    try {
      const parsed = parseStrictMatrixTextInput(
        nextText,
        minSize,
        maxSize,
        mode,
      );
      onInputErrorChange?.('');
      onShapeChange(parsed.shape, parsed.values);
      onValuesChange(parsed.values);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Invalid matrix text input.';
      onInputErrorChange?.(message);
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className={labelClass}>
          <MathText>{`${matrixSymbol} \\bmod ${modulusLabel}`}</MathText>
        </span>
        <div className="flex items-center gap-2">
          <ToggleGroup
            minimal
            ariaLabel="Matrix text parse style"
            value={parseMode}
            onChange={(next) => {
              try {
                const parsedCurrent = parseMatrixTextByMode(
                  matrixText,
                  parseMode,
                );
                const converted = matrixValuesToMode(parsedCurrent.values, next);
                setMatrixText(converted);
                setParseMode(next);
                applyTextInput(converted, next);
              } catch {
                setParseMode(next);
                applyTextInput(matrixText, next);
              }
            }}
            options={[
              { value: 'space', label: 'Text' },
              { value: 'csv', label: 'CSV' },
              { value: 'latex', label: 'LaTeX' },
            ]}
          />
          <CopyButton value={matrixText} tabIndex={-1} />
        </div>
      </div>

      <div className="mt-4">
        <textarea
          value={matrixText}
          onChange={(e) => {
            const next = e.target.value;

            if (parseMode === 'latex') {
              setMatrixText(next);
              applyTextInput(next, parseMode);
              return;
            }

            const allowedPattern = parseMode === 'csv' ? /^[\d\s,]*$/ : /^[\d\s]*$/;
            if (allowedPattern.test(next)) {
              setMatrixText(next);
              applyTextInput(next, parseMode);
            }
          }}
          className={`${inputClass} min-h-28 font-mono`}
          spellCheck={false}
          placeholder={
            parseMode === 'csv'
              ? `1,2,3\n4,5,6\n7,8,9`
              : parseMode === 'latex'
                ? `$$ \\begin{bmatrix}\n1 & 2 & 3 \\\\n4 & 5 & 6 \\\\n7 & 8 & 9\n\\end{bmatrix} $$`
                : `1 2 3\n4 5 6\n7 8 9`
          }
        />
      </div>
    </div>
  );
};

export default MatrixInput;
