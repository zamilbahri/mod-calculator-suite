import assert from 'node:assert/strict';
import test from 'node:test';

import { primalityCheck as primalityTest } from './numberTheory';

test('primalityTest classifies edge values with small-prime method', () => {
  assert.equal(primalityTest(0n).verdict, 'Composite');
  assert.equal(primalityTest(1n).verdict, 'Composite');
  assert.equal(primalityTest(2n).verdict, 'Prime');
  assert.equal(primalityTest(3n).verdict, 'Prime');
  assert.equal(primalityTest(4n).verdict, 'Composite');
  assert.equal(primalityTest(9n).verdict, 'Composite');
  assert.equal(primalityTest(10n).verdict, 'Composite');
  assert.equal(primalityTest(13n).verdict, 'Prime');
  assert.equal(primalityTest(15n).verdict, 'Composite');
  assert.equal(primalityTest(97n).verdict, 'Prime');

  assert.equal(primalityTest(9n).method, 'Small Prime Check');
  assert.equal(primalityTest(10n).method, 'Small Prime Check');
  assert.equal(primalityTest(13n).method, 'Small Prime Check');
  assert.equal(primalityTest(15n).method, 'Small Prime Check');
  assert.equal(primalityTest(97n).method, 'Small Prime Check');
  assert.equal(primalityTest(4n).method, 'Small Prime Check');
});

test('primalityTest reports known small-prime factors', () => {
  const evenComposite = primalityTest(100n);
  assert.equal(evenComposite.verdict, 'Composite');
  assert.equal(evenComposite.method, 'Small Prime Check');
  assert.equal(evenComposite.compositeReason, 'Factor found: 2');

  const oddComposite = primalityTest(561n);
  assert.equal(oddComposite.verdict, 'Composite');
  assert.equal(oddComposite.method, 'Small Prime Check');
  assert.equal(oddComposite.compositeReason, 'Factor found: 3');
});

test('primalityTest uses Baille-PSW for 64-bit-range candidates', () => {
  const largest64BitPrime = 18446744073709551557n; // 2^64 - 59
  const result = primalityTest(largest64BitPrime);

  assert.equal(result.verdict, 'Prime');
  assert.equal(result.method, 'Baille-PSW');
  assert.equal(result.rounds, 0);
  assert.equal(result.errorProbabilityExponent, 0);

  const m31 = primalityTest(2147483647n);
  assert.equal(m31.verdict, 'Prime');
  assert.equal(m31.method, 'Baille-PSW');

  const bpswComposite = primalityTest(1000036000099n); // 1000003 * 1000033
  assert.equal(bpswComposite.verdict, 'Composite');
  assert.equal(bpswComposite.method, 'Baille-PSW');
});

test('primalityTest classifies 300-digit prime and composite correctly', () => {
  const large300DigitPrime = BigInt(
    '127132076458401757468036623152695170984739359706586150912663216528593321429869090699746992326534144324300661301717226849991136593663378040378008951682192002064562184945251552794785466183505623083116528861380924896057046777619381099928260749089717152750908752433292730083647631169999993130024512888541',
  );
  const primeResult = primalityTest(large300DigitPrime);
  assert.equal(primeResult.verdict, 'Probably Prime');
  assert.equal(primeResult.method, 'Miller-Rabin');

  const large300DigitComposite = BigInt(
    '240730376638477781633428760246088328628926821240075613429589604482442047388650034801981574059866668251318811448279592394261986244949892886797890430391904570508784495682121085195443622282609104374004021235548275476963302350204539457088120127570535094487178842007183240271474546948478974651361543211561',
  );
  const compositeResult = primalityTest(large300DigitComposite);
  assert.equal(compositeResult.verdict, 'Composite');
  assert.equal(compositeResult.method, 'Miller-Rabin');
});
