import React, { useEffect, useState } from 'react';
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

const TWO_POW_64 = 1n << 64n;

const PrimeChecker: React.FC = () => {
  const [n, setN] = useState('');
  const [result, setResult] = useState<PrimalityCheckResult | null>(null);
  const [error, setError] = useState<React.ReactNode>(null);
  const [computed, setComputed] = useState(false);
  const [working, setWorking] = useState(false);
  const [testMethod, setTestMethod] = useState<
    'Auto' | 'Miller-Rabin' | 'Baillie-PSW'
  >('Auto');
  const [mrRounds, setMrRounds] = useState(24);
  const [recommendation, setRecommendation] = useState('');
  const [testMethodOpen, setTestMethodOpen] = useState(false);
  const [mrRoundsOpen, setMrRoundsOpen] = useState(false);

  useEffect(() => {
    const value = n.trim();
    if (value === '') {
      setRecommendation('');
      return;
    }

    const timer = setTimeout(() => {
      if (!/^\d+$/.test(value)) {
        setRecommendation('');
        return;
      }

      const parsed = BigInt(value);
      setRecommendation(
        parsed < TWO_POW_64
          ? 'Recommended: Baillie-PSW'
          : 'Recommended: Miller-Rabin',
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [n]);

  const compute = async () => {
    setError(null);
    setResult(null);
    setComputed(true);
    setWorking(true);

    try {
      await new Promise((r) => setTimeout(r, 0));

      const input = parseBigIntStrict(n, 'n');
      setResult(
        primalityCheck(input, {
          method: testMethod,
          millerRabinRounds: mrRounds,
        }),
      );
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="min-h-5 text-sm italic text-gray-300">
            {recommendation}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-gray-300">
              <span className="italic">Primality Test:</span>
              <div className="relative">
                <select
                  value={testMethod}
                  onMouseDown={() => setTestMethodOpen((prev) => !prev)}
                  onBlur={() => setTestMethodOpen(false)}
                  onChange={(e) => {
                    setTestMethod(
                      e.target.value as 'Auto' | 'Miller-Rabin' | 'Baillie-PSW',
                    );
                    setTestMethodOpen(false);
                  }}
                  className="appearance-none rounded border border-gray-700 bg-gray-900 px-2 py-1 pr-8 text-sm text-gray-100 transition-colors duration-200 ease-out focus:border-gray-500"
                >
                  <option value="Auto">Auto</option>
                  <option value="Miller-Rabin">Miller-Rabin</option>
                  <option value="Baillie-PSW">Baillie-PSW</option>
                </select>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 transition-transform duration-200 ease-out ${
                    testMethodOpen ? 'rotate-180' : ''
                  }`}
                >
                  ▾
                </span>
              </div>
            </label>

            <label
              className={`flex items-center gap-2 text-xs ${
                testMethod === 'Baillie-PSW' ? 'text-gray-500' : 'text-gray-300'
              }`}
            >
              <span className="italic">Miller-Rabin Rounds:</span>
              <div className="relative">
                <select
                  value={mrRounds}
                  onMouseDown={() => setMrRoundsOpen((prev) => !prev)}
                  onBlur={() => setMrRoundsOpen(false)}
                  onChange={(e) => {
                    setMrRounds(Number(e.target.value));
                    setMrRoundsOpen(false);
                  }}
                  disabled={testMethod === 'Baillie-PSW'}
                  className="appearance-none rounded border border-gray-700 bg-gray-900 px-2 py-1 pr-8 text-sm text-gray-100 transition-colors duration-200 ease-out focus:border-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {[16, 24, 32, 40, 48, 56, 64].map((rounds) => (
                    <option key={rounds} value={rounds}>
                      {rounds}
                    </option>
                  ))}
                </select>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 transition-transform duration-200 ease-out ${
                    mrRoundsOpen ? 'rotate-180' : ''
                  }`}
                >
                  ▾
                </span>
              </div>
            </label>
          </div>
        </div>

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
        <div className="flex flex-wrap items-center gap-3">
          {working ? (
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-gray-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-gray-300" />
              Computing...
            </p>
          ) : null}
          {!working && computed && result ? (
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
          ) : null}
        </div>
      </div>

      {!working && computed && result ? (
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
          {result.method === 'Baillie-PSW' &&
          (result.verdict === 'Prime' ||
            result.verdict === 'Probably Prime') ? (
            <MathText className="block text-sm text-gray-200">
              {
                '\\text{No counterexample to the Baillie-PSW test is known; exhaustively checked for odd n < } 2^{64}'
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
          {result.method === 'Baillie-PSW' && result.verdict === 'Composite' ? (
            <MathText className="block text-sm text-gray-200">
              {'\\text{Baillie-PSW test failed}'}
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
