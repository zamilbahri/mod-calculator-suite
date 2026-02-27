/**
 * RSA modulus factor-recovery helpers.
 *
 * Includes prechecks, range partitioning, and wheel-based trial division
 * with heartbeat reporting for long-running scans.
 */
import type { RsaRecoverWorkerId } from '../../../types';
import { PRIMES_LESS_THAN_1K } from '../primality/constants';
import { gcd } from '../core';

type AttemptState = {
  attempts: number;
};

/**
 * Found RSA factor pair.
 *
 * @typedef {object} RsaFactorPair
 * @property {bigint} p - First factor.
 * @property {bigint} q - Second factor.
 */
export type RsaFactorPair = {
  p: bigint;
  q: bigint;
};

/**
 * Worker scan range for factor recovery.
 *
 * @typedef {object} RsaRecoveryRange
 * @property {RsaRecoverWorkerId} workerId - Worker identity for UI/state mapping.
 * @property {bigint} start - Inclusive range start.
 * @property {bigint} [endExclusive] - Optional exclusive range end.
 */
export type RsaRecoveryRange = {
  workerId: RsaRecoverWorkerId;
  start: bigint;
  endExclusive?: bigint;
};

/**
 * Options for wheel-scan factor search over a bounded range.
 *
 * @interface FindPrimeFactorsInRangeOptions
 * @property {bigint} n - Target composite modulus.
 * @property {bigint} startInclusive - Inclusive scan start.
 * @property {bigint | null} endExclusive - Exclusive scan end, or null for unbounded.
 * @property {(attempts: number) => void} onHeartbeat - Progress callback.
 * @property {number} [heartbeatBatchSize] - Callback interval in attempted divisors.
 */
export interface FindPrimeFactorsInRangeOptions {
  n: bigint;
  startInclusive: bigint;
  endExclusive: bigint | null;
  onHeartbeat: (attempts: number) => void;
  heartbeatBatchSize?: number;
}

/**
 * Options for fast factor prechecks before long scans.
 *
 * @interface RunRsaRecoveryPrechecksOptions
 * @property {bigint} n - Target modulus.
 * @property {bigint} sqrtN - Integer square root of `n`.
 * @property {bigint | null} [pCandidate] - Optional known/guessed `p`.
 * @property {bigint | null} [qCandidate] - Optional known/guessed `q`.
 * @property {readonly bigint[]} [quickPrecheckPrimes] - Additional small primes to test.
 */
export interface RunRsaRecoveryPrechecksOptions {
  n: bigint;
  sqrtN: bigint;
  pCandidate?: bigint | null;
  qCandidate?: bigint | null;
  quickPrecheckPrimes?: readonly bigint[];
}

const HEARTBEAT_BATCH_SIZE = 5_000_000;
const WHEEL_BASE = 2n * 3n * 5n * 7n * 11n;
/** Prime factors represented in the wheel base and always prechecked first. */
export const RSA_WHEEL_PRECHECK_PRIMES = [2n, 3n, 5n, 7n, 11n] as const;
/** Additional quick precheck primes (small primes under 1000 excluding wheel base). */
export const RSA_QUICK_PRECHECK_PRIMES = PRIMES_LESS_THAN_1K.slice(
  RSA_WHEEL_PRECHECK_PRIMES.length,
);

const isPrimeByTrialDivision = (value: bigint): boolean => {
  if (value <= 1n) return false;
  if (value === 2n || value === 3n) return true;
  if (value % 2n === 0n) return false;

  let divisor = 3n;
  while (divisor * divisor <= value) {
    if (value % divisor === 0n) return false;
    divisor += 2n;
  }
  return true;
};

/**
 * Returns the next prime immediately above `n`.
 *
 * This helper is intentionally used with the final prime in `PRIMES_LESS_THAN_1K`
 * so recovery scanning starts just above guaranteed precheck coverage.
 */
const nextSmallPrime = (n: bigint): bigint => {
  let candidate = n + 1n;
  if (candidate <= 2n) return 2n;
  if (candidate % 2n === 0n) candidate += 1n;
  while (!isPrimeByTrialDivision(candidate)) {
    candidate += 2n;
  }
  return candidate;
};

const RSA_RECOVERY_MIN_START = nextSmallPrime(
  PRIMES_LESS_THAN_1K[PRIMES_LESS_THAN_1K.length - 1],
);

const WHEEL_OFFSETS: bigint[] = (() => {
  const residues: bigint[] = [];
  let candidate = 1n;
  while (candidate < WHEEL_BASE) {
    if (gcd(candidate, WHEEL_BASE) === 1n) residues.push(candidate);
    candidate += 1n;
  }
  return residues;
})();

/**
 * Emits heartbeat callback at configured attempt intervals.
 *
 * @param {AttemptState} state - Mutable attempt counter state.
 * @param {(attempts: number) => void} onHeartbeat - Heartbeat callback.
 * @param {number} heartbeatBatchSize - Emit period in attempts.
 */
const emitHeartbeatMaybe = (
  state: AttemptState,
  onHeartbeat: (attempts: number) => void,
  heartbeatBatchSize: number,
) => {
  if (state.attempts % heartbeatBatchSize === 0) {
    onHeartbeat(state.attempts);
  }
};

/**
 * Scans a candidate range using a 2*3*5*7*11 wheel to skip obvious composites.
 *
 * @param {bigint} n - Target modulus.
 * @param {bigint} startInclusive - Inclusive starting divisor.
 * @param {bigint | null} endExclusive - Optional exclusive end.
 * @param {AttemptState} state - Shared attempt counter.
 * @param {(attempts: number) => void} onHeartbeat - Progress callback.
 * @param {number} heartbeatBatchSize - Callback interval.
 * @returns {bigint | null} Found factor or null.
 */
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

/**
 * Computes integer square root `floor(sqrt(n))`.
 *
 * @param {bigint} n - Non-negative integer.
 * @returns {bigint} Integer square root.
 * @throws {Error} If `n` is negative.
 */
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

/**
 * Searches for a factor pair in a scan range.
 *
 * @param {FindPrimeFactorsInRangeOptions} options - Range scan options.
 * @returns {RsaFactorPair | null} Found factor pair or null.
 */
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

/**
 * Runs fast factor prechecks before expensive scans.
 *
 * @param {RunRsaRecoveryPrechecksOptions} options - Precheck options.
 * @returns {RsaFactorPair | null} Factor pair when detected, otherwise null.
 */
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

/**
 * Builds two complementary scan ranges for parallel recovery workers.
 *
 * `balanced` scans near expected balanced factors, while `low` covers smaller divisors.
 *
 * @param {bigint} n - Target modulus.
 * @param {bigint} trialUpperExclusive - Exclusive upper bound for trial division.
 * @returns {RsaRecoveryRange[]} Worker range assignments.
 */
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
