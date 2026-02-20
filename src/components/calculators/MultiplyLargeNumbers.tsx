import React, { useState } from 'react';
import CopyableCodeBlock from '../shared/CopyableCodeBlock';
import { parseBigIntStrict } from '../../utils/numberTheory';
import MathText from '../shared/MathText';
import { inputClass, labelClass, primaryButtonClass } from '../shared/ui';

const MultiplyLargeNumbers: React.FC = () => {
  const [p, setP] = useState('');
  const [q, setQ] = useState('');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [working, setWorking] = useState(false);

  const compute = async () => {
    setError('');
    setResult('');
    setWorking(true);

    try {
      // Yield once so UI can show "Computing..."
      await new Promise((r) => setTimeout(r, 0));

      const P = parseBigIntStrict(p, 'p');
      const Q = parseBigIntStrict(q, 'q');

      const R = (P * Q).toString();
      setResult(R);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid input.');
    } finally {
      setWorking(false);
    }
  };

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            <MathText>p</MathText>
          </label>
          <input
            value={p}
            onChange={(e) => setP(e.target.value)}
            placeholder="Enter an integer (digits only)"
            className={inputClass}
            inputMode="numeric"
            spellCheck={false}
          />
        </div>

        <div>
          <label className={labelClass}>
            <MathText>q</MathText>
          </label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Enter an integer (digits only)"
            className={inputClass}
            inputMode="numeric"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={compute}
          disabled={working}
          className={primaryButtonClass}
        >
          {working ? 'Computing…' : 'Multiply'}
        </button>

        <button
          type="button"
          onClick={() => {
            setP('');
            setQ('');
            setResult('');
            setError('');
          }}
          className={
            'px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 hover:bg-gray-600'
          }
        >
          Clear
        </button>
      </div>

      {error ? (
        <div className="mt-4 p-3 rounded-lg border border-red-500/40 bg-red-900/20 text-red-200">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-6">
          <CopyableCodeBlock
            label={
              <span>
                Result <MathText>p \times q</MathText>
              </span>
            }
            value={result}
          />
        </div>
      ) : null}
    </div>
  );
};

export default MultiplyLargeNumbers;
