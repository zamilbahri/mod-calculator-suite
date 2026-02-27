import assert from 'node:assert/strict';
import test from 'node:test';

import {
  bigIntToBytes,
  buildAlphabetEncoding,
  buildRsaRecoveryRanges,
  bytesToBigInt,
  computeLambdaN,
  computeModulus,
  computePhi,
  computePrivateExponent,
  decryptRsaMessage,
  encryptRsaMessage,
  findPrimeFactorsInRange,
  formatCiphertextBlocks,
  integerSqrt,
  isValidPublicExponentForPhi,
  parseCiphertextInputToDecimal,
  resolveRsaBlockSize,
  runRsaRecoveryPrechecks,
  RSA_QUICK_PRECHECK_PRIMES,
} from './numberTheory';

test('RSA key math helpers compute expected values for classic sample', () => {
  const p = 61n;
  const q = 53n;
  const n = computeModulus(p, q);
  const phi = computePhi(p, q);
  const lambda = computeLambdaN(p, q);
  const e = 17n;
  const d = computePrivateExponent(e, phi);

  assert.equal(n, 3233n);
  assert.equal(phi, 3120n);
  assert.equal(lambda, 780n);
  assert.equal(isValidPublicExponentForPhi(e, phi), true);
  assert.equal((e * d) % phi, 1n);
});

test('RSA encoding helpers build alphabet and round-trip bigint bytes', () => {
  const encoding = buildAlphabetEncoding({
    alphabetMode: 'custom',
    customAlphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    customIgnoreCase: true,
    customOffset: '0',
  });

  assert.equal(encoding.radix, 26n);
  assert.equal(encoding.normalizeChar('a'), 'A');
  assert.equal(encoding.charToValue.get('A'), 0n);
  assert.equal(encoding.charToValue.get('Z'), 25n);

  const value = 0x0102FFn;
  assert.equal(bytesToBigInt(bigIntToBytes(value)), value);
});

test('RSA radix mode encrypt/decrypt round-trips deterministic text', () => {
  const encoding = buildAlphabetEncoding({
    alphabetMode: 'custom',
    customAlphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    customIgnoreCase: true,
    customOffset: '0',
  });

  const e = 17n;
  const d = 2753n;
  const n = 3233n;
  const message = 'HELLO';

  const ciphertext = encryptRsaMessage({
    message,
    e,
    n,
    encodingMode: 'radix',
    blockSize: 1,
    encoding,
  });

  const plaintext = decryptRsaMessage({
    ciphertext: ciphertext.join(' '),
    d,
    n,
    encodingMode: 'radix',
    blockSize: 1,
    encoding,
  });

  assert.equal(plaintext, message);
});

test('RSA fixed-width numeric mode encrypt/decrypt round-trips deterministic text', () => {
  const encoding = buildAlphabetEncoding({
    alphabetMode: 'custom',
    customAlphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    customIgnoreCase: true,
    customOffset: '0',
  });

  const e = 17n;
  const d = 2753n;
  const n = 3233n;
  const message = 'TEST';

  const ciphertext = encryptRsaMessage({
    message,
    e,
    n,
    encodingMode: 'fixed-width-numeric',
    blockSize: 4,
    encoding,
  });

  const plaintext = decryptRsaMessage({
    ciphertext: ciphertext.join(' '),
    d,
    n,
    encodingMode: 'fixed-width-numeric',
    blockSize: 4,
    encoding,
  });

  assert.equal(plaintext, message);
});

test('RSA ciphertext formatting/parsing converts between decimal, hex, and base64', () => {
  const decimalBlocks = ['65', '66', '255'];

  const hex = formatCiphertextBlocks(decimalBlocks, 'hex');
  const fromHex = parseCiphertextInputToDecimal(hex, 'hex');
  assert.equal(fromHex, decimalBlocks.join(' '));

  const base64 = formatCiphertextBlocks(decimalBlocks, 'base64');
  const fromBase64 = parseCiphertextInputToDecimal(base64, 'base64');
  assert.equal(fromBase64, decimalBlocks.join(' '));
});

test('RSA recovery helpers find factors and build expected worker ranges', () => {
  const n = 3233n;
  const sqrtN = integerSqrt(n);
  assert.equal(sqrtN, 56n);

  const prechecked = runRsaRecoveryPrechecks({ n, sqrtN });
  assert.notEqual(prechecked, null);
  if (prechecked) {
    assert.equal(prechecked.p * prechecked.q, n);
  }

  const found = findPrimeFactorsInRange({
    n: 299n,
    startInclusive: 7n,
    endExclusive: 20n,
    onHeartbeat: () => {},
    heartbeatBatchSize: 1,
  });
  assert.deepEqual(found, { p: 13n, q: 23n });

  const smallRanges = buildRsaRecoveryRanges(n, sqrtN + 1n);
  assert.equal(smallRanges.length, 0);

  const largeN = 10_000_000_000n;
  const largeRanges = buildRsaRecoveryRanges(largeN, integerSqrt(largeN) + 1n);
  assert.equal(largeRanges.length, 2);
  assert.equal(largeRanges[0].workerId, 'balanced');
  assert.equal(largeRanges[1].workerId, 'low');
  assert.equal(largeRanges[1].endExclusive, largeRanges[0].start);
  const lastQuickPrecheckPrime =
    RSA_QUICK_PRECHECK_PRIMES[RSA_QUICK_PRECHECK_PRIMES.length - 1];
  assert.notEqual(lastQuickPrecheckPrime, undefined);
  assert.ok(largeRanges[1].start > lastQuickPrecheckPrime);
});

test('resolveRsaBlockSize uses defaults and validates bad inputs', () => {
  assert.equal(
    resolveRsaBlockSize({
      blockSizeInput: '',
      encodingMode: 'radix',
      defaultBlockSize: 3,
    }),
    3,
  );
  assert.equal(
    resolveRsaBlockSize({
      blockSizeInput: '',
      encodingMode: 'fixed-width-numeric',
      defaultBlockSize: 3,
    }),
    6,
  );

  assert.throws(
    () =>
      resolveRsaBlockSize({
        blockSizeInput: '0',
        encodingMode: 'radix',
        defaultBlockSize: 3,
      }),
    /Block size must be a positive integer/,
  );
});
