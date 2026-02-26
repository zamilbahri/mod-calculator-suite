[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/primality/generatePrime](../README.md) / getPrimeGenerationWarnThreshold

# Function: getPrimeGenerationWarnThreshold()

> **getPrimeGenerationWarnThreshold**(`size`, `sizeType`): `number` \| `null`

Defined in: [src/utils/numberTheory/primality/generatePrime.ts:48](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/primality/generatePrime.ts#L48)

Returns UI warning threshold for requested generation parameters.

## Parameters

### size

`number`

Requested prime size.

### sizeType

[`PrimeSizeType`](../../../../../types/numberTheory/type-aliases/PrimeSizeType.md)

Size unit.

## Returns

`number` \| `null`

Count threshold that should trigger warning, or null.
