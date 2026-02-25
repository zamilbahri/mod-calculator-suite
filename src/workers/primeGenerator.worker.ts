/// <reference lib="webworker" />

import { generatePrimesWithProgress } from '../utils/numberTheory';
import type {
  PrimeGeneratorWorkerCompletedMessage,
  PrimeGeneratorWorkerErrorMessage,
  PrimeGeneratorWorkerHeartbeatMessage,
  PrimeGeneratorWorkerProgressMessage,
  PrimeGeneratorWorkerRequest,
} from '../types';

const ctx: DedicatedWorkerGlobalScope = self as DedicatedWorkerGlobalScope;

ctx.onmessage = async (event: MessageEvent<PrimeGeneratorWorkerRequest>) => {
  const msg = event.data;
  if (msg.type !== 'generate') return;

  try {
    const start = performance.now();
    let lastHeartbeatTs = 0;
    const primes = await generatePrimesWithProgress(
      msg.options,
      (completed, total, prime) => {
        const progress: PrimeGeneratorWorkerProgressMessage = {
          type: 'progress',
          jobId: msg.jobId,
          completed,
          total,
          prime: prime.toString(),
        };
        ctx.postMessage(progress);
      },
      (primeIndex, total, attempts) => {
        const now = performance.now();
        if (now - lastHeartbeatTs < 500) return;
        lastHeartbeatTs = now;
        const heartbeat: PrimeGeneratorWorkerHeartbeatMessage = {
          type: 'heartbeat',
          jobId: msg.jobId,
          primeIndex,
          total,
          attempts,
        };
        ctx.postMessage(heartbeat);
      },
    );

    const done: PrimeGeneratorWorkerCompletedMessage = {
      type: 'completed',
      jobId: msg.jobId,
      elapsedMs: performance.now() - start,
      primes: primes.map((p) => p.toString()),
    };
    ctx.postMessage(done);
  } catch (e) {
    const err: PrimeGeneratorWorkerErrorMessage = {
      type: 'error',
      jobId: msg.jobId,
      message: e instanceof Error ? e.message : 'Failed to generate primes.',
    };
    ctx.postMessage(err);
  }
};

export {};
