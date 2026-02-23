import React, { useMemo, useState } from 'react';
import NumericOutput from '../shared/NumericOutput';
import {
  errorBoxClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../shared/ui';
import {
  generatePrimesWithProgress,
  getPrimeGenerationWarnThreshold,
  MAX_GENERATED_PRIME_BITS,
  MAX_GENERATED_PRIME_DIGITS,
  validatePrimeGenerationRequest,
  type PrimeSizeType,
} from '../../utils/numberTheory';

const PrimeGenerator: React.FC = () => {
  const [size, setSize] = useState('');
  const [sizeType, setSizeType] = useState<PrimeSizeType>('bits');
  const [count, setCount] = useState('1');
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [primes, setPrimes] = useState<string[]>([]);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [completionSummary, setCompletionSummary] = useState<string | null>(null);

  const sizeValue = useMemo(() => Number.parseInt(size, 10), [size]);
  const countValue = useMemo(() => Number.parseInt(count, 10), [count]);

  const liveError = useMemo(() => {
    if (!size) return null;
    if (!Number.isInteger(sizeValue) || sizeValue <= 0) {
      return 'Prime size must be a positive integer.';
    }
    if (sizeType === 'bits' && sizeValue > MAX_GENERATED_PRIME_BITS) {
      return `Maximum size is ${MAX_GENERATED_PRIME_BITS} bits.`;
    }
    if (sizeType === 'digits' && sizeValue > MAX_GENERATED_PRIME_DIGITS) {
      return `Maximum size is ${MAX_GENERATED_PRIME_DIGITS} digits.`;
    }
    if (!count) return null;
    if (!Number.isInteger(countValue) || countValue <= 0) {
      return 'Number of primes must be a positive integer.';
    }
    return validatePrimeGenerationRequest(sizeValue, sizeType, countValue);
  }, [size, sizeType, count, sizeValue, countValue]);

  const warning = useMemo(() => {
    if (liveError) return null;
    if (!Number.isInteger(sizeValue) || sizeValue <= 0) return null;
    if (!Number.isInteger(countValue) || countValue <= 0) return null;
    const warnAt = getPrimeGenerationWarnThreshold(sizeValue, sizeType);
    if (warnAt === null) return null;
    if (countValue >= warnAt) {
      return 'Warning: generation may take up to 1 minute.';
    }
    return null;
  }, [liveError, sizeType, sizeValue, countValue]);

  const generate = async () => {
    setError(null);
    setPrimes([]);
    setCompletionSummary(null);
    setProgress({ completed: 0, total: countValue || 0 });

    if (!Number.isInteger(sizeValue) || sizeValue <= 0) {
      setError('Prime size must be a positive integer.');
      return;
    }
    if (!Number.isInteger(countValue) || countValue <= 0) {
      setError('Number of primes must be a positive integer.');
      return;
    }
    const validationError = validatePrimeGenerationRequest(
      sizeValue,
      sizeType,
      countValue,
    );
    if (validationError) {
      setError(validationError);
      return;
    }

    setWorking(true);
    try {
      await new Promise((r) => setTimeout(r, 0));
      const start = performance.now();
      const generated = await generatePrimesWithProgress(
        {
          size: sizeValue,
          sizeType,
          count: countValue,
        },
        (completed, total, prime) => {
          setProgress({ completed, total });
          setPrimes((prev) => [...prev, prime.toString()]);
        },
      );
      const elapsedSeconds = (performance.now() - start) / 1000;
      setCompletionSummary(
        `${generated.length} primes generated in ${elapsedSeconds.toFixed(2)} seconds.`,
      );
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Failed to generate primes.');
      }
    } finally {
      setWorking(false);
    }
  };

  const clear = () => {
    setSize('');
    setSizeType('bits');
    setCount('1');
    setError(null);
    setPrimes([]);
    setCompletionSummary(null);
    setProgress({ completed: 0, total: 0 });
  };

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-purple-300">Prime Size</span>
          <input
            value={size}
            onChange={(e) => {
              const v = e.target.value;
              if (/^\d*$/.test(v)) setSize(v);
            }}
            className={inputClass}
            inputMode="numeric"
            placeholder={sizeType === 'bits' ? 'e.g. 512' : 'e.g. 155'}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-purple-300">Size Type</span>
          <select
            value={sizeType}
            onChange={(e) => setSizeType(e.target.value as PrimeSizeType)}
            className={inputClass}
          >
            <option value="bits">bits</option>
            <option value="digits">digits</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-purple-300">Number of Primes</span>
          <input
            value={count}
            onChange={(e) => {
              const v = e.target.value;
              if (/^\d*$/.test(v)) setCount(v);
            }}
            className={inputClass}
            inputMode="numeric"
            placeholder="1"
          />
        </label>
      </div>

      {liveError ? (
        <div className={errorBoxClass}>{liveError}</div>
      ) : warning ? (
        <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-900/20 p-3 text-amber-200">
          {warning}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={generate}
          disabled={working || !!liveError}
          className={primaryButtonClass}
        >
          {working ? 'Generating…' : 'Generate Primes'}
        </button>
        <button type="button" onClick={clear} className={secondaryButtonClass}>
          Clear
        </button>
        {working ? (
          <p className="text-sm text-gray-300">
            Generating prime ({progress.completed}/{progress.total || countValue || 0})
          </p>
        ) : null}
        {!working && completionSummary ? (
          <p className="text-sm text-gray-300">{completionSummary}</p>
        ) : null}
      </div>

      {error ? <div className={errorBoxClass}>{error}</div> : null}

      {primes.length > 0 ? (
        <div className="mt-4 space-y-4">
          {primes.map((value, idx) => (
            <NumericOutput key={`${idx}-${value.slice(0, 24)}`} label={`Prime ${idx + 1}`} value={value} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default PrimeGenerator;
