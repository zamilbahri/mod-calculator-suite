export class MathValidationError extends Error {
  fieldNames: string[];
  reason: string;
  expectedValue?: string;

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

export function isNonNegativeIntegerString(s: string): boolean {
  return s === '' || /^\d+$/.test(s);
}

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
