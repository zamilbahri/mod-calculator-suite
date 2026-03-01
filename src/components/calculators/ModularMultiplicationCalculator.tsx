import React, { useState } from 'react';
import MathText from '../shared/MathText';
import NumericOutput from '../shared/NumericOutput';
import {
  errorBoxClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../shared/ui';
import {
  parseBigIntStrict,
  modNormalize,
} from '../../utils/numberTheory';
import NumericInput from '../shared/NumericInput';

const ModularMultiplicationCalculator: React.FC = () => {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [n, setN] = useState('');

  const [error, setError] = useState<string>('');
  const [working, setWorking] = useState(false);
  const [computed, setComputed] = useState(false);
  const [result, setResult] = useState<bigint | null>(null);

  const compute = async () => {
    setError('');
    setComputed(false);
    setResult(null);
    setWorking(true);

    try {
      await new Promise((r) => setTimeout(r, 0));
      const A = parseBigIntStrict(a, 'a');
      const B = parseBigIntStrict(b, 'b');
      const N = parseBigIntStrict(n, 'n');

      if (N <= 0n) {
        throw new Error('Modulus n must be positive.');
      }

      // Compute (a * b) mod n. Normalize both before multiplication if needed.
      // Or just do a * b mod n, then normalize.
      const res = modNormalize(A * B, N);

      setResult(res);
      setComputed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid input.');
    } finally {
      setWorking(false);
    }
  };

  const clear = () => {
    setA('');
    setB('');
    setN('');
    setComputed(false);
    setResult(null);
    setError('');
  };

  return (
    <div>
      <div className="grid sm:grid-cols-3 gap-4">
        <NumericInput
          label={<MathText>a</MathText>}
          value={a}
          onChange={(val) => {
            setA(val);
            setComputed(false);
          }}
          onEnter={compute}
        />
        <NumericInput
          label={<MathText>b</MathText>}
          value={b}
          onChange={(val) => {
            setB(val);
            setComputed(false);
          }}
          onEnter={compute}
        />
        <NumericInput
          label={<MathText>n</MathText>}
          value={n}
          onChange={(val) => {
            setN(val);
            setComputed(false);
          }}
          onEnter={compute}
        />
      </div>
      <div className="mt-4 flex items-center gap-3 pb-1">
        <button
          type="button"
          onClick={compute}
          disabled={working}
          className={primaryButtonClass}
        >
          {working ? 'Computing…' : 'Compute'}
        </button>
        <button type="button" onClick={clear} className={secondaryButtonClass}>
          Clear
        </button>
      </div>
      {error ? <div className={errorBoxClass}>{error}</div> : null}
      {computed && result !== null ? (
        <div className="mt-6 space-y-4">
          <NumericOutput
          label={
            <MathText>{`a \\cdot b \\pmod{n}`}</MathText>
          }
          value={result.toString()}
          />        </div>
      ) : null}
    </div>
  );
};

export default ModularMultiplicationCalculator;
