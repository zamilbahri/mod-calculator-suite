import React, { useEffect, useMemo, useRef, useState } from 'react';
import NumericOutput from '../shared/NumericOutput';
import {
  errorBoxClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../shared/ui';
import {
  getPrimeGenerationWarnThreshold,
  MAX_GENERATED_PRIME_BITS,
  MAX_GENERATED_PRIME_DIGITS,
  validatePrimeGenerationRequest,
  type PrimeSizeType,
  type PrimeGenerationOptions,
} from '../../utils/numberTheory';

type WorkerProgressMessage = {
  type: 'progress';
  jobId: number;
  completed: number;
  total: number;
  prime: string;
};

type WorkerCompletedMessage = {
  type: 'completed';
  jobId: number;
  elapsedMs: number;
  primes: string[];
};

type WorkerHeartbeatMessage = {
  type: 'heartbeat';
  jobId: number;
  primeIndex: number;
  total: number;
  attempts: number;
};

type WorkerErrorMessage = {
  type: 'error';
  jobId: number;
  message: string;
};

type WorkerResponse =
  | WorkerProgressMessage
  | WorkerHeartbeatMessage
  | WorkerCompletedMessage
  | WorkerErrorMessage;

const createPrimeGeneratorWorker = (): Worker =>
  new Worker(new URL('../../workers/primeGenerator.worker.ts', import.meta.url), {
    type: 'module',
  });

const PrimeGenerator: React.FC = () => {
  const [size, setSize] = useState('');
  const [sizeType, setSizeType] = useState<PrimeSizeType>('bits');
  const [count, setCount] = useState('1');
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [primes, setPrimes] = useState<string[]>([]);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [completionSummary, setCompletionSummary] = useState<string | null>(null);
  const [heartbeat, setHeartbeat] = useState<{ primeIndex: number; attempts: number } | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const jobIdRef = useRef(0);

  const initWorker = () => {
    const worker = createPrimeGeneratorWorker();
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const msg = event.data;
      if (msg.jobId !== jobIdRef.current) return;

      if (msg.type === 'progress') {
        setProgress({ completed: msg.completed, total: msg.total });
        setPrimes((prev) => [...prev, msg.prime]);
        setHeartbeat(null);
        return;
      }

      if (msg.type === 'heartbeat') {
        setHeartbeat({ primeIndex: msg.primeIndex, attempts: msg.attempts });
        // eslint-disable-next-line no-console
        console.log(
          `[PrimeGenerator worker] prime ${msg.primeIndex}/${msg.total} attempts=${msg.attempts}`,
        );
        return;
      }

      if (msg.type === 'completed') {
        setWorking(false);
        setHeartbeat(null);
        if (msg.primes.length > 0) {
          setPrimes((prev) => (prev.length > 0 ? prev : msg.primes));
        }
        setCompletionSummary(
          `${msg.primes.length} primes generated in ${(msg.elapsedMs / 1000).toFixed(2)} seconds.`,
        );
        return;
      }

      setWorking(false);
      setError(msg.message);
    };
    workerRef.current = worker;
  };

  useEffect(() => {
    initWorker();
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

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

  const generate = () => {
    setError(null);
    setPrimes([]);
    setCompletionSummary(null);
    setHeartbeat(null);
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

    const options: PrimeGenerationOptions = {
      size: sizeValue,
      sizeType,
      count: countValue,
    };

    if (!workerRef.current) initWorker();
    if (!workerRef.current) {
      setError('Failed to initialize worker.');
      return;
    }

    const nextJobId = jobIdRef.current + 1;
    jobIdRef.current = nextJobId;
    setWorking(true);
    workerRef.current.postMessage({
      type: 'generate',
      jobId: nextJobId,
      options,
    });
  };

  const clear = () => {
    if (working && workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      initWorker();
    }

    setSize('');
    setSizeType('bits');
    setCount('1');
    setError(null);
    setPrimes([]);
    setCompletionSummary(null);
    setHeartbeat(null);
    setProgress({ completed: 0, total: 0 });
    setWorking(false);
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
          <div className="text-sm text-gray-300">
            <p>
              Generating prime ({progress.completed}/{progress.total || countValue || 0})
            </p>
            {heartbeat ? (
              <p className="text-xs text-gray-400">
                Prime {heartbeat.primeIndex} attempts: {heartbeat.attempts}
              </p>
            ) : null}
          </div>
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
