/// <reference lib="webworker" />

import { gcd, modInverse } from '../utils/numberTheory';

type RecoverRequest = {
  type: 'recover';
  jobId: number;
  workerId: 'balanced' | 'low';
  n: string;
  start: string;
  endExclusive?: string;
  e?: string;
};

type WorkerRequest = RecoverRequest;

type HeartbeatMessage = {
  type: 'heartbeat';
  jobId: number;
  workerId: 'balanced' | 'low';
  attempts: number;
};

type CompletedMessage = {
  type: 'completed';
  jobId: number;
  workerId: 'balanced' | 'low';
  p: string;
  q: string;
  phi: string;
  d: string;
};

type NotFoundMessage = {
  type: 'not_found';
  jobId: number;
  workerId: 'balanced' | 'low';
};

type ErrorMessage = {
  type: 'error';
  jobId: number;
  workerId: 'balanced' | 'low';
  message: string;
};

const ctx: DedicatedWorkerGlobalScope = self as DedicatedWorkerGlobalScope;

const WHEEL_PRIMES = [2n, 3n, 5n, 7n, 11n] as const;
const WHEEL_BASE = WHEEL_PRIMES.reduce((acc, p) => acc * p, 1n);
const HEARTBEAT_BATCH_SIZE = 5_000_000;
const WHEEL_OFFSETS: bigint[] = (() => {
  const residues: bigint[] = [];
  let candidate = 1n;
  while (candidate < WHEEL_BASE) {
    if (gcd(candidate, WHEEL_BASE) === 1n) residues.push(candidate);
    candidate += 1n;
  }
  return residues;
})();

type AttemptState = {
  attempts: number;
};

const emitHeartbeatMaybe = (
  state: AttemptState,
  onHeartbeat: (attempts: number) => void,
) => {
  if (state.attempts % HEARTBEAT_BATCH_SIZE === 0) {
    onHeartbeat(state.attempts);
  }
};

const scanWheelRange = (
  n: bigint,
  startInclusive: bigint,
  endExclusive: bigint | null,
  state: AttemptState,
  onHeartbeat: (attempts: number) => void,
): bigint | null => {
  if (startInclusive <= 1n) startInclusive = 2n;
  let block = (startInclusive / WHEEL_BASE) * WHEEL_BASE;
  let offsetIndex = 0;
  while (
    offsetIndex < WHEEL_OFFSETS.length &&
    block + WHEEL_OFFSETS[offsetIndex] < startInclusive
  ) {
    offsetIndex += 1;
  }
  if (offsetIndex >= WHEEL_OFFSETS.length) {
    block += WHEEL_BASE;
    offsetIndex = 0;
  }

  while (true) {
    for (let i = offsetIndex; i < WHEEL_OFFSETS.length; i += 1) {
      const candidate = block + WHEEL_OFFSETS[i];
      if (endExclusive !== null && candidate >= endExclusive) return null;
      if (candidate * candidate > n) return null;

      state.attempts += 1;
      emitHeartbeatMaybe(state, onHeartbeat);
      if (n % candidate === 0n) return candidate;
    }
    block += WHEEL_BASE;
    offsetIndex = 0;
  }
};

const findPrimeFactors = (
  n: bigint,
  startInclusive: bigint,
  endExclusive: bigint | null,
  onHeartbeat: (attempts: number) => void,
): { p: bigint; q: bigint } | null => {
  const state: AttemptState = { attempts: 0 };

  const factor = scanWheelRange(n, startInclusive, endExclusive, state, onHeartbeat);
  if (factor !== null) return { p: factor, q: n / factor };

  onHeartbeat(state.attempts);
  return null;
};

ctx.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const msg = event.data;
  if (msg.type !== 'recover') return;

  try {
    const n = BigInt(msg.n);
    const start = BigInt(msg.start);
    const endExclusive =
      typeof msg.endExclusive === 'string' && msg.endExclusive.trim() !== ''
        ? BigInt(msg.endExclusive)
        : null;

    if (n <= 1n) throw new Error('n must be greater than 1.');
    if (start <= 1n) throw new Error('Invalid recovery range.');
    if (endExclusive !== null && endExclusive <= start) {
      const notFound: NotFoundMessage = {
        type: 'not_found',
        jobId: msg.jobId,
        workerId: msg.workerId,
      };
      ctx.postMessage(notFound);
      return;
    }

    const factors = findPrimeFactors(n, start, endExclusive, (attempts) => {
      const heartbeat: HeartbeatMessage = {
        type: 'heartbeat',
        jobId: msg.jobId,
        workerId: msg.workerId,
        attempts,
      };
      ctx.postMessage(heartbeat);
    });
    if (!factors) {
      const notFound: NotFoundMessage = {
        type: 'not_found',
        jobId: msg.jobId,
        workerId: msg.workerId,
      };
      ctx.postMessage(notFound);
      return;
    }

    const p = factors.p;
    const q = factors.q;
    const phi = (p - 1n) * (q - 1n);

    let d = '';
    if (typeof msg.e === 'string' && msg.e.trim() !== '') {
      const e = BigInt(msg.e);
      if (e > 1n && e < n && gcd(e, phi) === 1n) {
        d = modInverse(e, phi).toString();
      }
    }
    const done: CompletedMessage = {
      type: 'completed',
      jobId: msg.jobId,
      workerId: msg.workerId,
      p: p.toString(),
      q: q.toString(),
      phi: phi.toString(),
      d,
    };
    ctx.postMessage(done);
  } catch (error) {
    const err: ErrorMessage = {
      type: 'error',
      jobId: msg.jobId,
      workerId: msg.workerId,
      message:
        error instanceof Error ? error.message : 'Failed to recover RSA key.',
    };
    ctx.postMessage(err);
  }
};

export {};
