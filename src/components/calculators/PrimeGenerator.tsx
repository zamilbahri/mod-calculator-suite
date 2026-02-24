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
  type PrimeGenerationOptions,
  type PrimeSizeType,
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
  new Worker(
    new URL('../../workers/primeGenerator.worker.ts', import.meta.url),
    { type: 'module' },
  );

const PrimeGenerator: React.FC = () => {
  const [size, setSize] = useState('');
  const [sizeType, setSizeType] = useState<PrimeSizeType>('bits');
  const [count, setCount] = useState('1');
  const [threads, setThreads] = useState('1');
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [primes, setPrimes] = useState<string[]>([]);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [completionSummary, setCompletionSummary] = useState<string | null>(
    null,
  );
  const [attemptMetrics, setAttemptMetrics] = useState({
    total: 0,
    perSecond: 0,
  });

  const workersRef = useRef<Worker[]>([]);
  const workerJobIdRef = useRef(new Map<Worker, number>());
  const jobIdRef = useRef(0);
  const runIdRef = useRef(0);
  const runStartedAtRef = useRef(0);
  const targetCountRef = useRef(0);
  const foundCountRef = useRef(0);
  const foundSetRef = useRef(new Set<string>());
  const totalAttemptsRef = useRef(0);
  const lastUiMetricsUpdateRef = useRef(0);

  const sizeValue = useMemo(() => Number.parseInt(size, 10), [size]);
  const countValue = useMemo(() => Number.parseInt(count, 10), [count]);
  const threadsValue = useMemo(() => Number.parseInt(threads, 10), [threads]);

  const maxThreads = useMemo(() => {
    // const hc = navigator.hardwareConcurrency ?? 4;
    // return Math.max(1, Math.min(8, hc - 1));
    // return Math.max(1, hc - 1);
    return navigator.hardwareConcurrency ?? 4;
  }, []);
  const recommendedThreads = useMemo(
    () => Math.max(1, Math.floor(maxThreads / 2)),
    [maxThreads],
  );

  const terminateWorkers = () => {
    for (const worker of workersRef.current) worker.terminate();
    workersRef.current = [];
    workerJobIdRef.current.clear();
  };

  useEffect(() => {
    return () => terminateWorkers();
  }, []);

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
    if (!threads) return null;
    if (!Number.isInteger(threadsValue) || threadsValue < 1) {
      return 'Thread count must be a positive integer.';
    }
    if (threadsValue > maxThreads) {
      return `Maximum thread count is ${maxThreads}.`;
    }
    return validatePrimeGenerationRequest(sizeValue, sizeType, countValue);
  }, [
    size,
    sizeType,
    count,
    threads,
    sizeValue,
    countValue,
    threadsValue,
    maxThreads,
  ]);

  const warning = useMemo(() => {
    if (liveError) return null;
    if (!Number.isInteger(sizeValue) || sizeValue <= 0) return null;
    if (!Number.isInteger(countValue) || countValue <= 0) return null;
    const warnAt = getPrimeGenerationWarnThreshold(sizeValue, sizeType);
    if (warnAt === null) return null;
    if (countValue >= warnAt) {
      return 'Warning: generation may take a few minutes. Recommended to use multiple threads.';
    }
    return null;
  }, [liveError, sizeType, sizeValue, countValue]);

  const dispatchOnePrimeJob = (
    worker: Worker,
    options: PrimeGenerationOptions,
    runId: number,
    workerIndex: number,
  ) => {
    if (runIdRef.current !== runId) return;
    if (foundCountRef.current >= targetCountRef.current) return;

    const nextJobId = ++jobIdRef.current;
    workerJobIdRef.current.set(worker, nextJobId);
    let lastAttemptsForJob = 0;

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      if (runIdRef.current !== runId) return;
      const msg = event.data;
      const expectedJobId = workerJobIdRef.current.get(worker);
      if (expectedJobId !== msg.jobId) return;

      if (msg.type === 'heartbeat') {
        const delta = Math.max(0, msg.attempts - lastAttemptsForJob);
        lastAttemptsForJob = msg.attempts;
        totalAttemptsRef.current += delta;

        const now = performance.now();
        if (now - lastUiMetricsUpdateRef.current >= 400) {
          const elapsedSeconds = Math.max(
            0.001,
            (now - runStartedAtRef.current) / 1000,
          );
          const perSecond = totalAttemptsRef.current / elapsedSeconds;
          setAttemptMetrics({
            total: totalAttemptsRef.current,
            perSecond,
          });
          lastUiMetricsUpdateRef.current = now;
        }
        return;
      }

      if (msg.type === 'error') {
        setWorking(false);
        setError(msg.message);
        terminateWorkers();
        return;
      }

      if (msg.type === 'completed') {
        const prime = msg.primes[0];
        if (prime && !foundSetRef.current.has(prime)) {
          foundSetRef.current.add(prime);
          foundCountRef.current += 1;
          setPrimes((prev) => [...prev, prime]);
          setProgress({
            completed: foundCountRef.current,
            total: targetCountRef.current,
          });
        }

        if (foundCountRef.current >= targetCountRef.current) {
          setWorking(false);
          setAttemptMetrics((prev) => ({
            ...prev,
            total: totalAttemptsRef.current,
            perSecond:
              totalAttemptsRef.current /
              Math.max(
                0.001,
                (performance.now() - runStartedAtRef.current) / 1000,
              ),
          }));
          const elapsedSeconds =
            (performance.now() - runStartedAtRef.current) / 1000;
          setCompletionSummary(
            `${targetCountRef.current} primes generated in ${elapsedSeconds.toFixed(2)} seconds.`,
          );
          terminateWorkers();
          return;
        }

        dispatchOnePrimeJob(worker, options, runId, workerIndex);
      }
    };

    worker.postMessage({
      type: 'generate',
      jobId: nextJobId,
      options: { ...options, count: 1 },
    });
  };

  const generate = () => {
    setError(null);
    setPrimes([]);
    setCompletionSummary(null);
    setAttemptMetrics({ total: 0, perSecond: 0 });
    setProgress({ completed: 0, total: countValue || 0 });

    if (!Number.isInteger(sizeValue) || sizeValue <= 0) {
      setError('Prime size must be a positive integer.');
      return;
    }
    if (!Number.isInteger(countValue) || countValue <= 0) {
      setError('Number of primes must be a positive integer.');
      return;
    }
    if (!Number.isInteger(threadsValue) || threadsValue < 1) {
      setError('Thread count must be a positive integer.');
      return;
    }
    if (threadsValue > maxThreads) {
      setError(`Maximum thread count is ${maxThreads}.`);
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
      count: 1,
    };

    terminateWorkers();
    runIdRef.current += 1;
    const runId = runIdRef.current;
    runStartedAtRef.current = performance.now();
    totalAttemptsRef.current = 0;
    lastUiMetricsUpdateRef.current = 0;
    targetCountRef.current = countValue;
    foundCountRef.current = 0;
    foundSetRef.current = new Set<string>();

    const workerCount = Math.max(1, threadsValue);
    workersRef.current = Array.from({ length: workerCount }, () =>
      createPrimeGeneratorWorker(),
    );

    setWorking(true);

    workersRef.current.forEach((worker, workerIndex) => {
      dispatchOnePrimeJob(worker, options, runId, workerIndex);
    });
  };

  const clear = () => {
    terminateWorkers();
    runIdRef.current += 1;

    setSize('');
    setSizeType('bits');
    setCount('1');
    setThreads('1');
    setError(null);
    setPrimes([]);
    setCompletionSummary(null);
    setAttemptMetrics({ total: 0, perSecond: 0 });
    setProgress({ completed: 0, total: 0 });
    setWorking(false);
  };

  const progressTotal = progress.total || countValue || 0;
  const currentPrimeIndex = Math.min(
    progress.completed + 1,
    Math.max(progressTotal, 1),
  );
  const hasAttemptMetrics = attemptMetrics.total > 0;

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-4">
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

        <label className="flex flex-col gap-1">
          <span className="text-sm text-purple-300">Threads</span>
          <select
            value={threads}
            onChange={(e) => setThreads(e.target.value)}
            className={inputClass}
          >
            {Array.from({ length: maxThreads }, (_, i) => String(i + 1)).map(
              (t) => (
                <option key={t} value={t}>
                  {Number(t) === recommendedThreads ? `${t} (Recommended)` : t}
                </option>
              ),
            )}
          </select>
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
            {progressTotal > 0 && progress.completed >= progressTotal ? (
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-gray-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-gray-300" />
                Finalizing generated primes...
              </p>
            ) : (
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-gray-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-gray-300" />
                Generating prime ({currentPrimeIndex}/{progressTotal})
              </p>
            )}
            {progress.completed < progressTotal ? (
              <p className="text-xs text-gray-400">
                ~{Math.round(attemptMetrics.total).toLocaleString()} candidates
                tested
                {' \u2022 '}~
                {Math.round(attemptMetrics.perSecond).toLocaleString()}/sec
              </p>
            ) : null}
          </div>
        ) : null}
        {!working && completionSummary ? (
          <div className="text-sm text-gray-300">
            <p>{completionSummary}</p>
            {hasAttemptMetrics ? (
              <p className="text-xs text-gray-400">
                ~{Math.round(attemptMetrics.total).toLocaleString()} candidates
                tested
                {' \u2022 '}~
                {Math.round(attemptMetrics.perSecond).toLocaleString()}/sec
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {error ? <div className={errorBoxClass}>{error}</div> : null}

      {primes.length > 0 ? (
        <div className="mt-4 space-y-4">
          {primes.map((value, idx) => (
            <NumericOutput
              key={`${idx}-${value.slice(0, 24)}`}
              label={`Prime ${idx + 1}`}
              value={value}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default PrimeGenerator;
