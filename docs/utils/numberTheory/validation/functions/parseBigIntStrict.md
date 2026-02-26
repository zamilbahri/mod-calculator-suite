[**mod-calculator-suite v0.0.0**](../../../../README.md)

***

[mod-calculator-suite](../../../../modules.md) / [utils/numberTheory/validation](../README.md) / parseBigIntStrict

# Function: parseBigIntStrict()

> **parseBigIntStrict**(`input`, `fieldName?`): `bigint`

Defined in: [src/utils/numberTheory/validation.ts:58](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/validation.ts#L58)

Parses a trimmed decimal bigint string with strict validation.

## Parameters

### input

`string`

Raw input text.

### fieldName?

`string` = `'value'`

Field label for error reporting.

## Returns

`bigint`

Parsed bigint value.

## Throws

If input is empty or not a non-negative integer.
