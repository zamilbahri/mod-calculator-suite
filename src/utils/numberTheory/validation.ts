/**
 * Input-validation helpers for number-theory parsing and UI fields.
 */
/**
 * Structured validation error for numeric parsing and constraints.
 *
 * Message format: `"<fieldNames> <reason> <expectedValue?>"`.
 */
export class MathValidationError extends Error {
  /** Field names associated with the failed validation. */
  fieldNames: string[];
  /** Human-readable failure reason. */
  reason: string;
  /** Optional expected value fragment appended to the message. */
  expectedValue?: string;

  /**
   * Creates a new validation error.
   *
   * @param {string | string[]} fieldNames - One or more failing field names.
   * @param {string} reason - Validation reason text.
   * @param {string} [expectedValue] - Optional expected-value suffix.
   */
  constructor(
    fieldNames: string | string[],
    reason: string,
    expectedValue?: string,
  ) {
    const namesArray = Array.isArray(fieldNames) ? fieldNames : [fieldNames];
    const valueSuffix = expectedValue !== undefined ? ` ${expectedValue}` : '';
    super(`${namesArray.join(', ')} ${reason}${valueSuffix}`);

    this.name = 'MathValidationError';
    this.fieldNames = namesArray;
    this.reason = reason;
    this.expectedValue = expectedValue;
  }
}

/**
 * Checks whether a string is empty or a non-negative integer literal.
 *
 * @param {string} s - Raw input string.
 * @returns {boolean} `true` when `s` is `''` or matches `/^\\d+$/`.
 */
export function isNonNegativeIntegerString(s: string): boolean {
  return s === '' || /^\d+$/.test(s);
}

/**
 * Parses a trimmed decimal bigint string with strict validation.
 *
 * @param {string} input - Raw input text.
 * @param {string} [fieldName='value'] - Field label for error reporting.
 * @returns {bigint} Parsed bigint value.
 * @throws {MathValidationError} If input is empty or not a non-negative integer.
 */
export function parseBigIntStrict(input: string, fieldName = 'value'): bigint {
  const s = input.trim();
  if (s === '') {
    throw new MathValidationError(fieldName, 'cannot be empty.');
  }
  if (!isNonNegativeIntegerString(s)) {
    throw new MathValidationError(fieldName, 'must be a non-negative integer.');
  }
  return BigInt(s);
}
