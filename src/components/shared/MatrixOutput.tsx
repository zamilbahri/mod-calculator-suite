import React, { useMemo, useState } from 'react';
import CopyButton from './CopyButton';
import type { MatrixTextParseMode } from './MatrixInput.helpers';
import { matrixValuesToMode, parseMatrixTextByMode } from './MatrixInput.helpers';
import ToggleGroup from './ToggleGroup';
import { labelClass } from './ui';

export interface MatrixOutputProps {
  value: string;
  label?: React.ReactNode;
  className?: string;
  sourceMode?: MatrixTextParseMode;
}

const MatrixOutput: React.FC<MatrixOutputProps> = ({
  value,
  label,
  className = '',
  sourceMode = 'space',
}) => {
  const [displayMode, setDisplayMode] = useState<MatrixTextParseMode>('space');

  const displayValue = useMemo(() => {
    if (!value) return '';

    try {
      const parsed = parseMatrixTextByMode(value, sourceMode);
      return matrixValuesToMode(parsed.values, displayMode);
    } catch {
      return value;
    }
  }, [value, sourceMode, displayMode]);

  const digitCount = displayValue.replace(/\D/g, '').length;

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          {label ? <span className={labelClass}>{label}</span> : null}
          {digitCount > 0 ? (
            <span className="text-xs text-gray-500">({digitCount} digits)</span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroup
            minimal
            ariaLabel="Matrix output style"
            value={displayMode}
            onChange={setDisplayMode}
            options={[
              { value: 'space', label: 'Text' },
              { value: 'csv', label: 'CSV' },
              { value: 'latex', label: 'LaTeX' },
            ]}
          />
          <CopyButton value={displayValue} tabIndex={0} />
        </div>
      </div>
      <pre className="bg-gray-900/60 border border-gray-700 rounded-lg p-4 overflow-auto">
        <code className="text-white whitespace-pre-wrap wrap-break-word">
          {displayValue}
        </code>
      </pre>
    </div>
  );
};

export default MatrixOutput;
