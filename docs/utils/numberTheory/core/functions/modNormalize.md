[**mod-calculator-suite v0.0.0**](../../../../README.md)

***

[mod-calculator-suite](../../../../modules.md) / [utils/numberTheory/core](../README.md) / modNormalize

# Function: modNormalize()

> **modNormalize**(`x`, `m`): `bigint`

Defined in: [src/utils/numberTheory/core.ts:17](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/core.ts#L17)

Normalizes a value into the canonical range `[0, m - 1]`.

## Parameters

### x

`bigint`

Value to normalize.

### m

`bigint`

Positive modulus.

## Returns

`bigint`

Canonical representative of `x mod m`.
