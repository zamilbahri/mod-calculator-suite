import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  trimGFPoly,
  parseGFPoly,
  prettyPrint,
  gfAdd,
  gfDivide,
  gfMod,
  gfMul,
  gfGCD,
  gfInverse,
} from './numberTheory/gf';

describe('Galois Field Polynomial Arithmetic', () => {
  describe('trimGFPoly', () => {
    it('trims trailing zeros', () => {
      assert.deepStrictEqual(trimGFPoly([1, 0, 1, 0, 0]), [1, 0, 1]);
    });

    it('returns [0] for an array of zeros', () => {
      assert.deepStrictEqual(trimGFPoly([0, 0, 0]), [0]);
    });

    it('returns [0] for empty array', () => {
      assert.deepStrictEqual(trimGFPoly([]), [0]); // Though not expected by type
    });
  });

  describe('parseGFPoly', () => {
    it('parses space-separated string highest degree first', () => {
      assert.deepStrictEqual(parseGFPoly('1 1 0 1'), [1, 0, 1, 1]);
    });

    it('handles empty string', () => {
      assert.deepStrictEqual(parseGFPoly(''), [0]);
    });

    it('takes absolute modulo 2 for coefficients', () => {
      assert.deepStrictEqual(parseGFPoly('-3 4 5'), [1, 0, 1]); // -3%2=1, 4%2=0, 5%2=1 -> [1, 0, 1]
    });
  });

  describe('prettyPrint', () => {
    it('formats a polynomial correctly', () => {
      assert.strictEqual(prettyPrint([1, 0, 1, 1]), 'x^3 + x^2 + 1');
      assert.strictEqual(prettyPrint([0, 1, 1]), 'x^2 + x');
    });

    it('handles zero polynomial', () => {
      assert.strictEqual(prettyPrint([0]), '0');
    });

    it('handles constant 1', () => {
      assert.strictEqual(prettyPrint([1]), '1');
    });
  });

  describe('gfAdd', () => {
    it('adds two polynomials over GF(2)', () => {
      assert.deepStrictEqual(gfAdd([1, 1, 0, 1], [1, 0, 1, 1]), [0, 1, 1]);
    });

    it('handles different length polynomials', () => {
      assert.deepStrictEqual(gfAdd([1], [0, 1]), [1, 1]);
    });
  });

  describe('gfDivide', () => {
    it('divides polynomials returning quotient and remainder', () => {
      // x^3 + x^2 + 1 / x + 1
      // a: [1, 0, 1, 1]
      // b: [1, 1]
      const { quotient, remainder } = gfDivide([1, 0, 1, 1], [1, 1]);
      // (x^3 + x^2 + 1) = (x^2)(x+1) + 1
      // Q: x^2 -> [0, 0, 1]
      // R: 1 -> [1]
      assert.deepStrictEqual(quotient, [0, 0, 1]);
      assert.deepStrictEqual(remainder, [1]);
    });

    it('throws on division by zero', () => {
      assert.throws(() => gfDivide([1], [0]), /Division by zero polynomial/);
    });

    it('handles degree of a < degree of b', () => {
      const { quotient, remainder } = gfDivide([1, 1], [1, 0, 1]);
      assert.deepStrictEqual(quotient, [0]);
      assert.deepStrictEqual(remainder, [1, 1]);
    });
  });

  describe('gfMod', () => {
    it('returns the remainder of division', () => {
      const remainder = gfMod([1, 0, 1, 1], [1, 1]);
      assert.deepStrictEqual(remainder, [1]);
    });
  });

  describe('gfMul', () => {
    it('multiplies polynomials over GF(2) without modulus', () => {
      // (x + 1) * (x + 1) = x^2 + 2x + 1 = x^2 + 1 over GF(2)
      assert.deepStrictEqual(gfMul([1, 1], [1, 1]), [1, 0, 1]);
    });

    it('multiplies polynomials over GF(2) with modulus', () => {
      // a = x^3 + x -> [0, 1, 0, 1]
      // b = x^7 + x^3 + x^2 + 1 -> [1, 0, 1, 1, 0, 0, 0, 1]
      // mod = x^8 + x^4 + x^3 + x + 1 -> [1, 1, 0, 1, 1, 0, 0, 0, 1]
      const result = gfMul(
        [0, 1, 0, 1],
        [1, 0, 1, 1, 0, 0, 0, 1],
        [1, 1, 0, 1, 1, 0, 0, 0, 1],
      );
      // As verified, x^2 + 1 -> [1, 0, 1]
      assert.deepStrictEqual(result, [1, 0, 1]);
    });

    it('handles multiplication with zero polynomial', () => {
      assert.deepStrictEqual(gfMul([1, 1], [0]), [0]);
      assert.deepStrictEqual(gfMul([0], [1, 1]), [0]);
    });
  });

  describe('gfGCD', () => {
    it('computes the Greatest Common Divisor', () => {
      // x^2 + x + 1 -> [1, 1, 1]
      // x^3 + x^2 + 1 -> [1, 0, 1, 1]
      // GCD = 1 -> [1] (coprime)
      const { gcd, steps } = gfGCD([1, 1, 1], [1, 0, 1, 1]);
      assert.deepStrictEqual(gcd, [1]);
      assert.ok(steps.length > 0);
    });

    it('computes GCD where one polynomial is a multiple of the other', () => {
      const { gcd } = gfGCD([1, 1], [1, 0, 1]);
      // (x+1) and (x^2+1) = (x+1)(x+1) -> GCD is (x+1) -> [1, 1]
      assert.deepStrictEqual(gcd, [1, 1]);
    });
  });

  describe('gfInverse', () => {
    it('computes modular inverse using EEA', () => {
      // a = x^5 -> [0, 0, 0, 0, 0, 1]
      // mod = x^8 + x^4 + x^3 + x + 1 -> [1, 1, 0, 1, 1, 0, 0, 0, 1]
      // fieldSize = 8
      const { inverse, steps } = gfInverse(
        [0, 0, 0, 0, 0, 1],
        [1, 1, 0, 1, 1, 0, 0, 0, 1],
      );
      // Inverse verified as x^5 + x^4 + x^3 + x -> [0, 1, 0, 1, 1, 1]
      assert.deepStrictEqual(inverse, [0, 1, 0, 1, 1, 1]);
      assert.ok(steps.length > 0);

      // Verification log structure
      const lastStep = steps[steps.length - 1];
      assert.ok('sNew' in lastStep);
      assert.ok('sOld' in lastStep);
    });

    it('throws if polynomials are not coprime', () => {
      // a = x + 1 -> [1, 1]
      // mod = x^2 + 1 -> [1, 0, 1]
      assert.throws(
        () => gfInverse([1, 1], [1, 0, 1]),
        /Inverse does not exist/,
      );
    });
  });
});
