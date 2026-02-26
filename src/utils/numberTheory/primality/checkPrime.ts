/**
 * Primality decision orchestration.
 *
 * Performs small-prime trial division first, then chooses Baillie-PSW or
 * Miller-Rabin based on user selection and input size.
 */
import type { PrimalityCheckResult } from '../../../types';
import type { PrimalityCheckOptions } from '../../../types';
import { PRIMES_LESS_THAN_1K, TWO_POW_64 } from './constants';
import { isBPSWProbablePrime } from './bpsw';
import {
  isMillerRabinProbablePrime,
  millerRabinErrorProbabilityExponent,
} from './millerRabin';

/**
 * Runs primality checks with method selection and confidence metadata.
 *
 * Selection rules:
 * - `Auto`: small-prime precheck, then BPSW for `n < 2^64`, otherwise Miller-Rabin.
 * - `Baillie-PSW`: forces BPSW after small-prime precheck.
 * - `Miller-Rabin`: forces randomized Miller-Rabin after small-prime precheck.
 *
 * Verdict semantics:
 * - `Prime`: deterministically resolved by small-prime checks or BPSW in `< 2^64` range.
 * - `Probably Prime`: probabilistic result.
 * - `Composite`: witness or factor found.
 *
 * `errorProbabilityExponent = k` corresponds to an upper bound of about `2^-k`
 * for false-prime classification in Miller-Rabin mode.
 *
 * @param {bigint} n - Integer to test.
 * @param {PrimalityCheckOptions | number} [options=24] - Method options or round count shortcut.
 * @returns {PrimalityCheckResult} Structured primality result.
 */
export function primalityCheck(
  n: bigint,
  options: PrimalityCheckOptions | number = 24,
): PrimalityCheckResult {
  const method =
    typeof options === 'number' ? 'Auto' : (options.method ?? 'Auto');
  const roundsInput =
    typeof options === 'number' ? options : (options.millerRabinRounds ?? 24);
  const mrIterations = Math.max(1, Math.floor(roundsInput));

  const exactPrime = (): PrimalityCheckResult => ({
    isProbablePrime: true,
    verdict: 'Prime',
    method: 'Small Prime Check',
    errorProbabilityExponent: 0,
    rounds: 0,
  });

  const exactComposite = (reason: string): PrimalityCheckResult => ({
    isProbablePrime: false,
    verdict: 'Composite',
    method: 'Small Prime Check',
    compositeReason: reason,
    rounds: 0,
  });

  if (n < 2n) return exactComposite('n < 2');
  if (n === 2n) return exactPrime();
  if ((n & 1n) === 0n) return exactComposite('Factor found: 2');

  for (const p of PRIMES_LESS_THAN_1K.slice(1)) {
    if (n === p) return exactPrime();
    if (n % p === 0n) return exactComposite(`Factor found: ${p.toString()}`);
  }

  if (method === 'Baillie-PSW' || (method === 'Auto' && n < TWO_POW_64)) {
    const bpswPrime = isBPSWProbablePrime(n);
    return {
      isProbablePrime: bpswPrime,
      verdict: bpswPrime
        ? n < TWO_POW_64
          ? 'Prime'
          : 'Probably Prime'
        : 'Composite',
      method: 'Baillie-PSW',
      errorProbabilityExponent: bpswPrime ? 0 : undefined,
      compositeReason: bpswPrime ? undefined : 'BPSW test failed',
      rounds: 0,
    };
  }

  const rounds = mrIterations;
  const mrResult = isMillerRabinProbablePrime(n, rounds);
  const primeLike = mrResult.isProbablePrime;
  return {
    isProbablePrime: primeLike,
    verdict: primeLike ? 'Probably Prime' : 'Composite',
    method: 'Miller-Rabin',
    errorProbabilityExponent: primeLike
      ? millerRabinErrorProbabilityExponent(rounds)
      : undefined,
    compositeReason: primeLike ? undefined : 'Miller-Rabin witness found',
    witness: primeLike ? undefined : mrResult.witness,
    rounds,
  };
}
