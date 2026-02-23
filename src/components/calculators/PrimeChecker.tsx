import React, { useState } from 'react';
import NumericInput from '../shared/NumericInput';
import MathText from '../shared/MathText';
import {
  errorBoxClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../shared/ui';
import {
  parseBigIntStrict,
  MathValidationError,
  primalityCheck,
} from '../../utils/numberTheory';
import { MathErrorView } from '../shared/MathErrorView';
import type { PrimalityCheckResult } from '../../types';

const PrimeChecker: React.FC = () => {
  const [n, setN] = useState('');
  const [result, setResult] = useState<PrimalityCheckResult | null>(null);
  const [error, setError] = useState<React.ReactNode>(null);
  const [computed, setComputed] = useState(false);
  const [working, setWorking] = useState(false);

  const compute = async () => {
    setError(null);
    setResult(null);
    setComputed(true);
    setWorking(true);

    try {
      await new Promise((r) => setTimeout(r, 0));

      const input = parseBigIntStrict(n, 'n');
      const isProbablePrime = primalityCheck(input);

      setResult({
        isProbablePrime: isProbablePrime.isProbablePrime,
        verdict: isProbablePrime.verdict,
        certaintyPercent: isProbablePrime.certaintyPercent,
        method: isProbablePrime.method,
        rounds: isProbablePrime.rounds,
      });
      return;
    } catch (e) {
      if (e instanceof MathValidationError) {
        setError(<MathErrorView error={e} />);
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Failed to check primality.');
      }
    } finally {
      setWorking(false);
    }
  };

  const clear = () => {
    setN('');
    setResult(null);
    setError(null);
    setComputed(false);
  };

  return (
    <div>
      <div className="grid gap-4">
        <NumericInput
          label={<MathText>n</MathText>}
          value={n}
          onChange={(value) => {
            setN(value);
            setComputed(false);
            setResult(null);
            setError(null);
          }}
          onEnter={compute}
          placeholder="Enter a non-negative integer to test"
          minRows={1}
          rows={4}
        />
      </div>

      <div className="mt-4 flex items-center gap-3 pb-1">
        <button
          type="button"
          onClick={compute}
          disabled={working}
          className={primaryButtonClass}
        >
          {working ? 'Checking…' : 'Check Prime'}
        </button>
        <button type="button" onClick={clear} className={secondaryButtonClass}>
          Clear
        </button>
      </div>

      {error ? <div className={errorBoxClass}>{error}</div> : null}

      {computed && result ? (
        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-lg bg-gray-900/40 border border-gray-700">
            <MathText block className="block text-sm text-gray-200">
              {`n = ${n.trim()}`}
            </MathText>
            <p
              className={`mt-2 text-sm font-semibold ${
                result.isProbablePrime ? 'text-green-300' : 'text-amber-300'
              }`}
            >
              {result.isProbablePrime ? 'Probably Prime' : 'Composite'}
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Method: {result.method}
              {result.rounds ? ` (${result.rounds} rounds)` : ''}. Certainty:{' '}
              {result.isProbablePrime
                ? `>= ${result.certaintyPercent} (lower bound with random independent bases)`
                : `${result.certaintyPercent} (composite witness found)`}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PrimeChecker;
