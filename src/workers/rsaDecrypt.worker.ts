/// <reference lib="webworker" />

import { gcd, modInverse } from '../utils/numberTheory';

type RecoverRequest = {
  type: 'recover';
  jobId: number;
  n: string;
  e?: string;
};

type WorkerRequest = RecoverRequest;

type HeartbeatMessage = {
  type: 'heartbeat';
  jobId: number;
  attempts: number;
};

type CompletedMessage = {
  type: 'completed';
  jobId: number;
  p: string;
  q: string;
  phi: string;
  d: string;
};

type ErrorMessage = {
  type: 'error';
  jobId: number;
  message: string;
};

const ctx: DedicatedWorkerGlobalScope = self as DedicatedWorkerGlobalScope;

const WHEEL_BASE = 30n;
const WHEEL_OFFSETS = [1n, 7n, 11n, 13n, 17n, 19n, 23n, 29n] as const;

type AttemptState = {
  attempts: number;
  lastHeartbeatTs: number;
};

const emitHeartbeatMaybe = (
  state: AttemptState,
  onHeartbeat: (attempts: number) => void,
) => {
  const now = performance.now();
  if (now - state.lastHeartbeatTs >= 250) {
    onHeartbeat(state.attempts);
    state.lastHeartbeatTs = now;
  }
};

const bitLength = (value: bigint): number => {
  let bits = 0;
  let v = value;
  while (v > 0n) {
    v >>= 1n;
    bits += 1;
  }
  return bits;
};

const scanWheelRange = (
  n: bigint,
  startInclusive: bigint,
  endExclusive: bigint | null,
  state: AttemptState,
  onHeartbeat: (attempts: number) => void,
): bigint | null => {
  if (startInclusive <= 1n) startInclusive = 2n;
  if (startInclusive % 2n === 0n) startInclusive += 1n;

  let block = (startInclusive / WHEEL_BASE) * WHEEL_BASE;
  while (true) {
    for (const offset of WHEEL_OFFSETS) {
      const candidate = block + offset;
      if (candidate < startInclusive) continue;
      if (endExclusive !== null && candidate >= endExclusive) return null;
      if (candidate * candidate > n) return null;

      state.attempts += 1;
      emitHeartbeatMaybe(state, onHeartbeat);
      if (n % candidate === 0n) return candidate;
    }
    block += WHEEL_BASE;
  }
};

const findPrimeFactors = (
  n: bigint,
  onHeartbeat: (attempts: number) => void,
): { p: bigint; q: bigint } | null => {
  if (n < 4n) return null;
  if (n % 2n === 0n) return { p: 2n, q: n / 2n };

  const state: AttemptState = { attempts: 0, lastHeartbeatTs: 0 };

  state.attempts += 1;
  emitHeartbeatMaybe(state, onHeartbeat);
  if (n % 3n === 0n) return { p: 3n, q: n / 3n };

  state.attempts += 1;
  emitHeartbeatMaybe(state, onHeartbeat);
  if (n % 5n === 0n) return { p: 5n, q: n / 5n };

  const nBits = bitLength(n);
  const halfBitsMinusOne = Math.floor(nBits / 2) - 1;
  const phaseAStart =
    halfBitsMinusOne >= 0 ? 1n << BigInt(halfBitsMinusOne) : 7n;
  const balancedStart = phaseAStart > 7n ? phaseAStart : 7n;

  const phaseAFactor = scanWheelRange(
    n,
    balancedStart,
    null,
    state,
    onHeartbeat,
  );
  if (phaseAFactor !== null) {
    return { p: phaseAFactor, q: n / phaseAFactor };
  }

  if (balancedStart > 7n) {
    const phaseBFactor = scanWheelRange(n, 7n, balancedStart, state, onHeartbeat);
    if (phaseBFactor !== null) {
      return { p: phaseBFactor, q: n / phaseBFactor };
    }
  }

  onHeartbeat(state.attempts);
  return null;
};

ctx.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const msg = event.data;
  if (msg.type !== 'recover') return;

  try {
    const n = BigInt(msg.n);

    if (n <= 1n) throw new Error('n must be greater than 1.');

    const factors = findPrimeFactors(n, (attempts) => {
      const heartbeat: HeartbeatMessage = {
        type: 'heartbeat',
        jobId: msg.jobId,
        attempts,
      };
      ctx.postMessage(heartbeat);
    });
    if (!factors) {
      throw new Error('Failed to factor n. Use a semiprime modulus.');
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
      message:
        error instanceof Error ? error.message : 'Failed to recover RSA key.',
    };
    ctx.postMessage(err);
  }
};

export {};
