import React, { useState } from 'react';
import MathText from '../shared/MathText';
import NumericOutput from '../shared/NumericOutput';
import NumericInput from '../shared/NumericInput';
import {
  errorBoxClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../shared/ui';
import { parseBigIntStrict } from '../../utils/numberTheory';

type Mode = 'product' | 'phi';

const MultiplyLargeNumbers: React.FC = () => {
  const [p, setP] = useState('');
  const [q, setQ] = useState('');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [mode, setMode] = useState<Mode>('product');

  const computeProduct = () => {
    setError('');
    setResult('');
    setMode('product');
    try {
      const P = parseBigIntStrict(p, 'p');
      const Q = parseBigIntStrict(q, 'q');
      setResult((P * Q).toString());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid input.');
    }
  };

  const computePhi = () => {
    setError('');
    setResult('');
    setMode('phi');
    try {
      const P = parseBigIntStrict(p, 'p');
      const Q = parseBigIntStrict(q, 'q');
      if (P === 0n || Q === 0n) {
        throw new Error('p and q must be at least 1 to compute (p-1)(q-1).');
      }
      const phi = (P - 1n) * (Q - 1n);
      setResult(phi.toString());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid input.');
    }
  };

  const clear = () => {
    setP('');
    setQ('');
    setResult('');
    setError('');
    setMode('product');
  };

  const outputLabel =
    mode === 'phi' ? (
      <MathText>{`\\phi = (p-1)\\cdot(q-1)`}</MathText>
    ) : (
      <MathText>{`n = p\\cdot q`}</MathText>
    );

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-4">
        <NumericInput
          label={<MathText>{'p'}</MathText>}
          value={p}
          onChange={(val) => {
            setP(val);
            // don’t clear result automatically; just invalidate errors
            setError('');
          }}
          onEnter={computeProduct}
          maxDigits={1000}
        />

        <NumericInput
          label={<MathText>{'q'}</MathText>}
          value={q}
          onChange={(val) => {
            setQ(val);
            setError('');
          }}
          onEnter={computeProduct}
          maxDigits={1000}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 pb-1">
        <button
          type="button"
          onClick={computeProduct}
          className={primaryButtonClass}
        >
          Multiply
        </button>

        <button
          type="button"
          onClick={computePhi}
          className={secondaryButtonClass}
          title="Compute ϕ = (p-1)(q-1)"
        >
          <MathText>{'\\phi = (p-1)\\cdot(q-1)'}</MathText>
        </button>

        <button type="button" onClick={clear} className={secondaryButtonClass}>
          Clear
        </button>
      </div>

      {error ? <div className={errorBoxClass}>{error}</div> : null}

      {result ? (
        <div className="mt-6">
          <NumericOutput label={outputLabel} value={result} />
        </div>
      ) : null}
    </div>
  );
};

export default MultiplyLargeNumbers;
