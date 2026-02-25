import type { RsaRecoverWorkerId } from '../../../types';
import { PRIMES_LESS_THAN_1K } from '../primality/constants';
import { gcd } from '../core';

type AttemptState = {
  attempts: number;
};

export type RsaFactorPair = {
  p: bigint;
  q: bigint;
};

export type RsaRecoveryRange = {
  workerId: RsaRecoverWorkerId;
  start: bigint;
  endExclusive?: bigint;
};

export interface FindPrimeFactorsInRangeOptions {
  n: bigint;
  startInclusive: bigint;
  endExclusive: bigint | null;
  onHeartbeat: (attempts: number) => void;
  heartbeatBatchSize?: number;
}

export interface RunRsaRecoveryPrechecksOptions {
  n: bigint;
  sqrtN: bigint;
  pCandidate?: bigint | null;
  qCandidate?: bigint | null;
  quickPrecheckPrimes?: readonly bigint[];
}

const HEARTBEAT_BATCH_SIZE = 5_000_000;
const RSA_RECOVERY_MIN_START = 7n;
const WHEEL_BASE = 2n * 3n * 5n * 7n * 11n;
const WHEEL_OFFSETS: bigint[] = (() => {
  const residues: bigint[] = [];
  let candidate = 1n;
  while (candidate < WHEEL_BASE) {
    if (gcd(candidate, WHEEL_BASE) === 1n) residues.push(candidate);
    candidate += 1n;
  }
  return residues;
})();

export const RSA_WHEEL_PRECHECK_PRIMES = [2n, 3n, 5n, 7n, 11n] as const;
export const RSA_QUICK_PRECHECK_PRIMES = PRIMES_LESS_THAN_1K.slice(5);

const emitHeartbeatMaybe = (
  state: AttemptState,
  onHeartbeat: (attempts: number) => void,
  heartbeatBatchSize: number,
) => {
  if (state.attempts % heartbeatBatchSize === 0) {
    onHeartbeat(state.attempts);
  }
};

const scanWheelRange = (
  n: bigint,
  startInclusive: bigint,
  endExclusive: bigint | null,
  state: AttemptState,
  onHeartbeat: (attempts: number) => void,
  heartbeatBatchSize: number,
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
      emitHeartbeatMaybe(state, onHeartbeat, heartbeatBatchSize);
      if (n % candidate === 0n) return candidate;
    }
    block += WHEEL_BASE;
    offsetIndex = 0;
  }
};

const tryFactorFromCandidate = (
  n: bigint,
  candidate: bigint | null | undefined,
): RsaFactorPair | null => {
  if (candidate === null || candidate === undefined || candidate <= 1n) {
    return null;
  }
  if (n % candidate !== 0n) return null;
  const other = n / candidate;
  if (other <= 1n) return null;
  return { p: candidate, q: other };
};

export const integerSqrt = (n: bigint): bigint => {
  if (n < 0n) throw new Error('Square root is undefined for negative values.');
  if (n < 2n) return n;

  let x = 1n << BigInt((n.toString(2).length + 1) >> 1);
  while (true) {
    const y = (x + n / x) >> 1n;
    if (y >= x) return x;
    x = y;
  }
};

export const findPrimeFactorsInRange = ({
  n,
  startInclusive,
  endExclusive,
  onHeartbeat,
  heartbeatBatchSize = HEARTBEAT_BATCH_SIZE,
}: FindPrimeFactorsInRangeOptions): RsaFactorPair | null => {
  const state: AttemptState = { attempts: 0 };
  const factor = scanWheelRange(
    n,
    startInclusive,
    endExclusive,
    state,
    onHeartbeat,
    heartbeatBatchSize,
  );
  if (factor !== null) return { p: factor, q: n / factor };

  onHeartbeat(state.attempts);
  return null;
};

export const runRsaRecoveryPrechecks = ({
  n,
  sqrtN,
  pCandidate = null,
  qCandidate = null,
  quickPrecheckPrimes = RSA_QUICK_PRECHECK_PRIMES,
}: RunRsaRecoveryPrechecksOptions): RsaFactorPair | null => {
  for (const candidate of RSA_WHEEL_PRECHECK_PRIMES) {
    const factors = tryFactorFromCandidate(n, candidate);
    if (factors !== null) return factors;
  }

  for (const candidate of quickPrecheckPrimes) {
    if (candidate > sqrtN) break;
    const factors = tryFactorFromCandidate(n, candidate);
    if (factors !== null) return factors;
  }

  if (sqrtN > 1n && sqrtN * sqrtN === n) return { p: sqrtN, q: sqrtN };

  const fromP = tryFactorFromCandidate(n, pCandidate);
  if (fromP !== null) return fromP;

  const fromQ = tryFactorFromCandidate(n, qCandidate);
  if (fromQ !== null) return fromQ;

  if (
    pCandidate !== null &&
    pCandidate !== undefined &&
    qCandidate !== null &&
    qCandidate !== undefined &&
    pCandidate > 1n &&
    qCandidate > 1n &&
    pCandidate * qCandidate === n
  ) {
    return { p: pCandidate, q: qCandidate };
  }

  return null;
};

export const buildRsaRecoveryRanges = (
  n: bigint,
  trialUpperExclusive: bigint,
): RsaRecoveryRange[] => {
  const bitLen = n.toString(2).length;
  const balancedStartRaw =
    1n << BigInt(Math.max(0, Math.floor(bitLen / 2) - 1));
  const balancedStart =
    balancedStartRaw > RSA_RECOVERY_MIN_START
      ? balancedStartRaw
      : RSA_RECOVERY_MIN_START;
  const lowRangeEndExclusive =
    balancedStart < trialUpperExclusive ? balancedStart : trialUpperExclusive;

  const ranges: RsaRecoveryRange[] = [];
  if (balancedStart < trialUpperExclusive) {
    ranges.push({
      workerId: 'balanced',
      start: balancedStart,
      endExclusive: trialUpperExclusive,
    });
  }
  if (lowRangeEndExclusive > RSA_RECOVERY_MIN_START) {
    ranges.push({
      workerId: 'low',
      start: RSA_RECOVERY_MIN_START,
      endExclusive: lowRangeEndExclusive,
    });
  }

  return ranges;
};
