import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isStrongProbablePrimeForBase,
  isMillerRabinProbablePrime,
} from './numberTheory';

test('isStrongProbablePrimeForBase handles edge cases and base normalization', () => {
  assert.equal(isStrongProbablePrimeForBase(0n, 2n), false);
  assert.equal(isStrongProbablePrimeForBase(1n, 2n), false);
  assert.equal(isStrongProbablePrimeForBase(2n, 1n), true);
  assert.equal(isStrongProbablePrimeForBase(3n, 2n), true);
  assert.equal(isStrongProbablePrimeForBase(10n, 3n), false);

  // a % n === 0 short-circuits to true in current implementation.
  assert.equal(isStrongProbablePrimeForBase(13n, 26n), true);

  // Negative bases are normalized modulo n.
  assert.equal(isStrongProbablePrimeForBase(13n, -2n), true);
});

test('isStrongProbablePrimeForBase separates primes from clear composites', () => {
  assert.equal(isStrongProbablePrimeForBase(97n, 5n), true);
  assert.equal(isStrongProbablePrimeForBase(9n, 2n), false);
  assert.equal(isStrongProbablePrimeForBase(15n, 2n), false);
});

test('Miller-Rabin primality checks classify common values correctly', () => {
  assert.equal(isMillerRabinProbablePrime(2n), true);
  assert.equal(isMillerRabinProbablePrime(97n), true);
  assert.equal(isMillerRabinProbablePrime(1n), false);
  assert.equal(isMillerRabinProbablePrime(100n), false);
  assert.equal(isMillerRabinProbablePrime(561n), false);
});

test('`Miller-Rabin classifies 300-digit prime and composite correctly`', () => {
  const largePrime = BigInt(
    '127132076458401757468036623152695170984739359706586150912663216528593321429869090699746992326534144324300661301717226849991136593663378040378008951682192002064562184945251552794785466183505623083116528861380924896057046777619381099928260749089717152750908752433292730083647631169999993130024512888541',
  );
  assert.equal(isMillerRabinProbablePrime(largePrime), true);
  const largeComposite = BigInt(
    '240730376638477781633428760246088328628926821240075613429589604482442047388650034801981574059866668251318811448279592394261986244949892886797890430391904570508784495682121085195443622282609104374004021235548275476963302350204539457088120127570535094487178842007183240271474546948478974651361543211561',
  );
  assert.equal(isMillerRabinProbablePrime(largeComposite), false);
});
