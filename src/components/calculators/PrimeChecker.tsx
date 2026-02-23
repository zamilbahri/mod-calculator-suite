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
      setResult(primalityCheck(input));
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

  const getSmallPrimeDivisor = (r: PrimalityCheckResult): string | null => {
    if (!r.compositeReason?.startsWith('Factor found: ')) return null;
    return r.compositeReason.slice('Factor found: '.length);
  };
  const smallPrimeDivisor = result ? getSmallPrimeDivisor(result) : null;

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
          placeholder="Enter a non-negative integer"
          minRows={1}
          rows={4}
          maxDigits={1000}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 pb-1">
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
        {computed && result ? (
          <div className="flex flex-wrap items-center gap-3">
            <p
              className={`inline-flex items-center gap-2 font-semibold ${
                result.isProbablePrime ? 'text-green-300' : 'text-amber-300'
              }`}
            >
              {result.isProbablePrime ? (
                <span aria-hidden="true">✓</span>
              ) : null}
              <MathText>{`\\text{${result.verdict}}`}</MathText>
            </p>
          </div>
        ) : null}
      </div>

      {computed && result ? (
        <div className="mt-2 space-y-2 p-4 rounded-lg bg-gray-900/40 border border-gray-700">
          {/* <div className="text-sm text-gray-300">Details:</div> */}
          <MathText className="block text-sm text-gray-200">
            {`\\text{Method Used: ${result.method}${result.method === 'Miller-Rabin' && result.rounds ? ` (${result.rounds} rounds)` : ''}}`}
          </MathText>
          {result.method === 'Small Prime Check' &&
          result.verdict === 'Prime' ? (
            <MathText className="block text-sm text-gray-200">
              {'\\text{Found in list of first 100 primes}'}
            </MathText>
          ) : null}
          {result.method === 'Miller-Rabin' &&
          result.verdict === 'Probably Prime' ? (
            <MathText className="block text-sm text-gray-200">{`\\text{Uncertainty } \\le 2^{-${result.errorProbabilityExponent ?? 0}}`}</MathText>
          ) : null}
          {result.method === 'Baille-PSW' && result.verdict === 'Prime' ? (
            <MathText className="block text-sm text-gray-200">
              {
                '\\text{No counterexample to Baille-PSW has been found for values below } 2^{64}'
              }
            </MathText>
          ) : null}
          {result.method === 'Small Prime Check' &&
          result.verdict === 'Composite' ? (
            smallPrimeDivisor ? (
              <MathText className="block text-sm text-gray-200">{`\\text{Divisible by small prime number: ${smallPrimeDivisor}}`}</MathText>
            ) : (
              <MathText className="block text-sm text-gray-200">{`\\text{${result.compositeReason ?? 'Composite'}}`}</MathText>
            )
          ) : null}
          {result.method === 'Baille-PSW' && result.verdict === 'Composite' ? (
            <MathText className="block text-sm text-gray-200">
              {'\\text{Baille-PSW test failed}'}
            </MathText>
          ) : null}
          {result.method === 'Miller-Rabin' &&
          result.verdict === 'Composite' ? (
            <MathText className="block text-sm text-gray-200">{`\\text{Miller-Rabin witness found: ${result.witness?.toString() ?? 'unknown'}}`}</MathText>
          ) : null}
        </div>
      ) : null}

      {error ? <div className={errorBoxClass}>{error}</div> : null}
    </div>
  );
};

export default PrimeChecker;
