[**mod-calculator-suite v0.0.0**](../../../../README.md)

***

[mod-calculator-suite](../../../../modules.md) / [utils/numberTheory/random](../README.md) / randomBigIntBelowAny

# Function: randomBigIntBelowAny()

> **randomBigIntBelowAny**(`upperExclusive`): `bigint`

Defined in: [src/utils/numberTheory/random.ts:47](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/random.ts#L47)

Samples uniformly from `[0, upperExclusive)`.

Uses rejection sampling to avoid modulo bias.

## Parameters

### upperExclusive

`bigint`

Exclusive upper bound (must be positive).

## Returns

`bigint`

Uniform random bigint below the upper bound.

## Throws

If `upperExclusive <= 0`.
