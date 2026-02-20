import React, { useState } from 'react';
import CopyableCodeBlock from '../shared/CopyableCodeBlock';
import { parseBigIntStrict } from '../../utils/numberTheory';
import MathText from '../shared/MathText';
import { primaryButtonClass, secondaryButtonClass } from '../shared/ui';
import NumericInput from '../shared/NumericInput';

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
        <NumericInput
          label={<MathText>p</MathText>}
          value={p}
          onChange={setP}
        />
        <NumericInput
          label={<MathText>q</MathText>}
          value={q}
          onChange={setQ}
        />
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
          className={secondaryButtonClass}
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
