[**mod-calculator-suite v0.0.0**](../../../../README.md)

***

[mod-calculator-suite](../../../../modules.md) / [utils/numberTheory/random](../README.md) / randomBigIntInRange

# Function: randomBigIntInRange()

> **randomBigIntInRange**(`minInclusive`, `maxInclusive`): `bigint`

Defined in: [src/utils/numberTheory/random.ts:93](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/random.ts#L93)

Samples uniformly from an inclusive range.

## Parameters

### minInclusive

`bigint`

Inclusive lower bound.

### maxInclusive

`bigint`

Inclusive upper bound.

## Returns

`bigint`

Uniform random bigint in `[minInclusive, maxInclusive]`.

## Throws

If `maxInclusive < minInclusive`.
