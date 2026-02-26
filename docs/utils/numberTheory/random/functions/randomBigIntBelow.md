[**mod-calculator-suite v0.0.0**](../../../../README.md)

***

[mod-calculator-suite](../../../../modules.md) / [utils/numberTheory/random](../README.md) / randomBigIntBelow

# Function: randomBigIntBelow()

> **randomBigIntBelow**(`upperExclusive`): `bigint`

Defined in: [src/utils/numberTheory/random.ts:78](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/random.ts#L78)

Samples uniformly from `[0, upperExclusive)` for Miller-Rabin base selection.

## Parameters

### upperExclusive

`bigint`

Exclusive upper bound (must be greater than 2).

## Returns

`bigint`

Uniform random bigint below the upper bound.

## Throws

If `upperExclusive <= 2`.
