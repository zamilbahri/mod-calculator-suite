/// <reference lib="webworker" />

import { generatePrimesWithProgress } from '../utils/numberTheory';
import type { PrimeGenerationOptions } from '../types';

type GenerateRequest = {
  type: 'generate';
  jobId: number;
  options: PrimeGenerationOptions;
};

type WorkerRequest = GenerateRequest;

type ProgressMessage = {
  type: 'progress';
  jobId: number;
  completed: number;
  total: number;
  prime: string;
};

type HeartbeatMessage = {
  type: 'heartbeat';
  jobId: number;
  primeIndex: number;
  total: number;
  attempts: number;
};

type CompletedMessage = {
  type: 'completed';
  jobId: number;
  elapsedMs: number;
  primes: string[];
};

type ErrorMessage = {
  type: 'error';
  jobId: number;
  message: string;
};

const ctx: DedicatedWorkerGlobalScope = self as DedicatedWorkerGlobalScope;

ctx.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const msg = event.data;
  if (msg.type !== 'generate') return;

  try {
    const start = performance.now();
    let lastHeartbeatTs = 0;
    const primes = await generatePrimesWithProgress(
      msg.options,
      (completed, total, prime) => {
        const progress: ProgressMessage = {
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
        const heartbeat: HeartbeatMessage = {
          type: 'heartbeat',
          jobId: msg.jobId,
          primeIndex,
          total,
          attempts,
        };
        ctx.postMessage(heartbeat);
      },
    );

    const done: CompletedMessage = {
      type: 'completed',
      jobId: msg.jobId,
      elapsedMs: performance.now() - start,
      primes: primes.map((p) => p.toString()),
    };
    ctx.postMessage(done);
  } catch (e) {
    const err: ErrorMessage = {
      type: 'error',
      jobId: msg.jobId,
      message: e instanceof Error ? e.message : 'Failed to generate primes.',
    };
    ctx.postMessage(err);
  }
};

export {};
