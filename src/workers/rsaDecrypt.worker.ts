/// <reference lib="webworker" />

import type {
  RsaDecryptCompletedMessage,
  RsaDecryptErrorMessage,
  RsaDecryptHeartbeatMessage,
  RsaDecryptNotFoundMessage,
  RsaDecryptWorkerRequest,
} from '../types';
import {
  computePhi,
  findPrimeFactorsInRange,
  gcd,
  modInverse,
} from '../utils/numberTheory';

const ctx: DedicatedWorkerGlobalScope = self as DedicatedWorkerGlobalScope;

ctx.onmessage = (event: MessageEvent<RsaDecryptWorkerRequest>) => {
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
      const notFound: RsaDecryptNotFoundMessage = {
        type: 'not_found',
        jobId: msg.jobId,
        workerId: msg.workerId,
      };
      ctx.postMessage(notFound);
      return;
    }

    const factors = findPrimeFactorsInRange({
      n,
      startInclusive: start,
      endExclusive,
      onHeartbeat: (attempts) => {
        const heartbeat: RsaDecryptHeartbeatMessage = {
          type: 'heartbeat',
          jobId: msg.jobId,
          workerId: msg.workerId,
          attempts,
        };
        ctx.postMessage(heartbeat);
      },
    });
    if (!factors) {
      const notFound: RsaDecryptNotFoundMessage = {
        type: 'not_found',
        jobId: msg.jobId,
        workerId: msg.workerId,
      };
      ctx.postMessage(notFound);
      return;
    }

    const p = factors.p;
    const q = factors.q;
    const phi = computePhi(p, q);

    let d = '';
    if (typeof msg.e === 'string' && msg.e.trim() !== '') {
      const e = BigInt(msg.e);
      if (e > 1n && e < n && gcd(e, phi) === 1n) {
        d = modInverse(e, phi).toString();
      }
    }
    const done: RsaDecryptCompletedMessage = {
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
    const err: RsaDecryptErrorMessage = {
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
