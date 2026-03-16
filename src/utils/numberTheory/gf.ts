/**
 * Trims trailing zeros from a polynomial array to ensure length = degree + 1.
 * If all coefficients are zeros, returns [0].
 * @param poly - The polynomial array to trim.
 * @returns The trimmed polynomial array.
 * @example
 * trimGFPoly([1, 0, 0]) // returns [1]
 */
export function trimGFPoly(poly: number[]): number[] {
  if (poly.length === 0) return [0];
  let i = poly.length - 1;
  while (i > 0 && poly[i] === 0) {
    i--;
  }
  return poly.slice(0, i + 1);
}

/**
 * Parses a space-separated string of coefficients (highest degree first) into a polynomial array (index = degree).
 * All coefficients are taken modulo 2.
 * @param input - Space-separated string of coefficients, e.g., "1 1 0 1"
 * @returns Polynomial array where index = degree.
 * @example
 * parseGFPoly("1 1 0 1") // returns [1, 0, 1, 1]
 */
export function parseGFPoly(input: string): number[] {
  if (!input.trim()) return [0];
  const tokens = input.trim().split(/\s+/).map(Number);
  const poly = tokens.reverse().map((c) => Math.abs(c) % 2);
  return trimGFPoly(poly);
}

/**
 * Returns a human-readable string representation of a polynomial over GF(2).
 * Skips terms with zero coefficients. Handles zero polynomial returning "0" and constant 1 returning "1".
 * @param coeffs - Polynomial array where index = degree.
 * @returns Formatted polynomial string.
 * @example
 * prettyPrint([1, 0, 1, 1]) // returns "x^3 + x^2 + 1"
 */
export function prettyPrint(coeffs: number[]): string {
  const trimmed = trimGFPoly(coeffs);
  if (trimmed.length === 1 && trimmed[0] === 0) return '0';

  const terms: string[] = [];
  for (let i = trimmed.length - 1; i >= 0; i--) {
    if (trimmed[i] !== 0) {
      if (i === 0) {
        terms.push('1');
      } else if (i === 1) {
        terms.push('x');
      } else {
        terms.push(`x^${i}`);
      }
    }
  }
  return terms.length > 0 ? terms.join(' + ') : '0';
}

/**
 * Adds (XORs) two polynomials over GF(2). Also serves as subtraction.
 * @param a - First polynomial.
 * @param b - Second polynomial.
 * @returns The sum of a and b over GF(2), with trailing zeros trimmed.
 * @example
 * gfAdd([1, 1, 0, 1], [1, 0, 1, 1]) // returns [0, 1, 1] (= x^2 + x)
 */
export function gfAdd(a: number[], b: number[]): number[] {
  const maxLength = Math.max(a.length, b.length);
  const result = new Array(maxLength).fill(0);
  for (let i = 0; i < maxLength; i++) {
    const valA = i < a.length ? a[i] : 0;
    const valB = i < b.length ? b[i] : 0;
    result[i] = (valA ^ valB) & 1;
  }
  return trimGFPoly(result);
}

/**
 * Helper function to return the degree of a polynomial.
 * @param poly - The polynomial.
 * @returns The degree of the polynomial, or -Infinity for the zero polynomial.
 * @example
 * getDegree([1, 0, 1]) // returns 2
 */
function getDegree(poly: number[]): number {
  const trimmed = trimGFPoly(poly);
  if (trimmed.length === 1 && trimmed[0] === 0) return -Infinity;
  return trimmed.length - 1;
}

/**
 * Divides polynomial a by polynomial b over GF(2) using polynomial long division.
 * @param a - Dividend polynomial.
 * @param b - Divisor polynomial.
 * @returns An object containing the quotient and remainder polynomials.
 * @throws {Error} If divisor is the zero polynomial.
 * @example
 * gfDivide([1, 0, 0, 0], [1, 1]) // returns { quotient: [1, 1, 1], remainder: [1] }
 */
export function gfDivide(
  a: number[],
  b: number[],
): { quotient: number[]; remainder: number[] } {
  let remainder = trimGFPoly([...a]);
  const divisor = trimGFPoly([...b]);

  const degB = getDegree(divisor);
  if (degB === -Infinity) {
    throw new Error('Division by zero polynomial');
  }

  if (getDegree(remainder) < degB) {
    return { quotient: [0], remainder };
  }

  const quotient = new Array(getDegree(remainder) - degB + 1).fill(0);

  while (getDegree(remainder) >= degB) {
    const degR = getDegree(remainder);
    const shift = degR - degB;
    quotient[shift] = 1;

    const shiftedDivisor = new Array(degR + 1).fill(0);
    for (let i = 0; i <= degB; i++) {
      shiftedDivisor[i + shift] = divisor[i];
    }

    remainder = gfAdd(remainder, shiftedDivisor);
  }

  return { quotient: trimGFPoly(quotient), remainder };
}

/**
 * Returns the remainder of dividing polynomial a by polynomial mod over GF(2).
 * @param a - Dividend polynomial.
 * @param mod - Divisor polynomial (modulus).
 * @returns The remainder polynomial.
 * @example
 * gfMod([1, 0, 0, 0], [1, 1]) // returns [1]
 */
export function gfMod(a: number[], mod: number[]): number[] {
  return gfDivide(a, mod).remainder;
}

/**
 * Multiplies two polynomials over GF(2) using schoolbook multiplication.
 * If mod is provided, the result is reduced modulo that polynomial.
 * @param a - First polynomial.
 * @param b - Second polynomial.
 * @param mod - Optional modulus polynomial for reduction.
 * @returns The unreduced or reduced product polynomial.
 * @example
 * gfMul([0, 1, 0, 1], [1, 0, 1, 1, 0, 0, 0, 1], [1, 1, 0, 1, 1, 0, 0, 0, 1]) // returns [1, 0, 1]
 */
export function gfMul(a: number[], b: number[], mod?: number[]): number[] {
  const aTrim = trimGFPoly(a);
  const bTrim = trimGFPoly(b);

  if (getDegree(aTrim) === -Infinity || getDegree(bTrim) === -Infinity) {
    return [0];
  }

  const result = new Array(aTrim.length + bTrim.length - 1).fill(0);

  for (let i = 0; i < aTrim.length; i++) {
    for (let j = 0; j < bTrim.length; j++) {
      result[i + j] ^= aTrim[i] & bTrim[j];
    }
  }

  const prod = trimGFPoly(result);

  if (mod) {
    return gfMod(prod, mod);
  }

  return prod;
}

/**
 * A step in the polynomial Greatest Common Divisor algorithm.
 */
export type StepLog = {
  /** The human-readable dividend polynomial for this step. */
  dividend: string;
  /** The human-readable divisor polynomial for this step. */
  divisor: string;
  /** The human-readable quotient polynomial for this step. */
  quotient: string;
  /** The human-readable remainder polynomial for this step. */
  remainder: string;
};

/**
 * Computes the Greatest Common Divisor of two polynomials over GF(2) using the Euclidean algorithm.
 * @param a - First polynomial.
 * @param b - Second polynomial.
 * @param fieldSize - The field size n for GF(2^n). Used for context/validation.
 * @returns The monic GCD polynomial and the sequence of logged steps.
 * @example
 * gfGCD([1, 1, 1], [1, 1, 0, 1], 8) // returns { gcd: [1], steps: [...] }
 */
export function gfGCD(
  a: number[],
  b: number[],
  fieldSize: number,
): { gcd: number[]; steps: StepLog[] } {
  if (getDegree(a) >= fieldSize) {
    throw new Error(
      `Polynomial a has degree ${getDegree(a)} which exceeds max degree ${fieldSize - 1} for GF(2^${fieldSize})`,
    );
  }
  if (getDegree(b) >= fieldSize) {
    throw new Error(
      `Polynomial b has degree ${getDegree(b)} which exceeds max degree ${fieldSize - 1} for GF(2^${fieldSize})`,
    );
  }

  let r0 = trimGFPoly(a);
  let r1 = trimGFPoly(b);
  const steps: StepLog[] = [];

  while (getDegree(r1) !== -Infinity) {
    const { quotient, remainder } = gfDivide(r0, r1);

    steps.push({
      dividend: prettyPrint(r0),
      divisor: prettyPrint(r1),
      quotient: prettyPrint(quotient),
      remainder: prettyPrint(remainder),
    });

    r0 = r1;
    r1 = remainder;
  }

  return { gcd: r0, steps };
}

/**
 * A step in the polynomial Extended Euclidean Algorithm.
 */
export type EEAStepLog = {
  /** The human-readable dividend polynomial for this step. */
  dividend: string;
  /** The human-readable divisor polynomial for this step. */
  divisor: string;
  /** The human-readable quotient polynomial for this step. */
  quotient: string;
  /** The human-readable remainder polynomial for this step. */
  remainder: string;
  /** The human-readable old s sequence value. */
  sOld: string;
  /** The human-readable newly updated s sequence value. */
  sNew: string;
};

/**
 * Computes the modular inverse of a polynomial over GF(2) using the Extended Euclidean Algorithm.
 * @param a - Polynomial to invert.
 * @param mod - Modulus polynomial.
 * @param fieldSize - The field size n for GF(2^n). Used for context/validation.
 * @returns The inverse polynomial and the sequence of logged steps.
 * @throws {Error} If the GCD of a and mod is not 1 (inverse does not exist).
 * @example
 * gfInverse([0, 0, 0, 0, 0, 1], [1, 1, 0, 1, 1, 0, 0, 0, 1], 8) // returns { inverse: [0, 1, 0, 1, 1, 1], steps: [...] }
 */
export function gfInverse(
  a: number[],
  mod: number[],
  fieldSize: number,
): { inverse: number[]; steps: EEAStepLog[] } {
  if (getDegree(a) >= fieldSize) {
    throw new Error(
      `Polynomial a has degree ${getDegree(a)} which exceeds max degree ${fieldSize - 1} for GF(2^${fieldSize})`,
    );
  }
  if (getDegree(mod) === -Infinity) {
    throw new Error(`Modulus polynomial cannot be zero`);
  }
  if (getDegree(a) >= getDegree(mod)) {
    throw new Error(
      `Polynomial a must have degree less than modulus, got degree ${getDegree(a)} vs ${getDegree(mod)}`,
    );
  }

  let old_r = trimGFPoly(mod);
  let r = trimGFPoly(a);
  let old_s = [0];
  let s = [1];

  const steps: EEAStepLog[] = [];

  while (getDegree(r) !== -Infinity) {
    const { quotient, remainder } = gfDivide(old_r, r);

    const prod = gfMul(quotient, s);
    const new_s = gfAdd(old_s, prod);

    steps.push({
      dividend: prettyPrint(old_r),
      divisor: prettyPrint(r),
      quotient: prettyPrint(quotient),
      remainder: prettyPrint(remainder),
      sOld: prettyPrint(old_s),
      sNew: prettyPrint(new_s),
    });

    old_r = r;
    r = remainder;

    old_s = s;
    s = new_s;
  }

  if (getDegree(old_r) !== 0 || old_r[0] !== 1) {
    throw new Error('Inverse does not exist: polynomials are not coprime.');
  }

  return { inverse: trimGFPoly(old_s), steps };
}
