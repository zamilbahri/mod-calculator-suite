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

const findPrimeFactors = (
  n: bigint,
  onHeartbeat: (attempts: number) => void,
): { p: bigint; q: bigint } | null => {
  if (n < 4n) return null;
  if (n % 2n === 0n) return { p: 2n, q: n / 2n };

  let p = 3n;
  let attempts = 0;
  let lastHeartbeatTs = 0;
  while (p * p <= n) {
    attempts += 1;
    const now = performance.now();
    if (now - lastHeartbeatTs >= 250) {
      onHeartbeat(attempts);
      lastHeartbeatTs = now;
    }
    if (n % p === 0n) return { p, q: n / p };
    p += 2n;
  }

  onHeartbeat(attempts);
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
