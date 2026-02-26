[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/primality/generatePrime](../README.md) / validatePrimeGenerationRequest

# Function: validatePrimeGenerationRequest()

> **validatePrimeGenerationRequest**(`size`, `sizeType`, `count?`): `string` \| `null`

Defined in: [src/utils/numberTheory/primality/generatePrime.ts:64](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/primality/generatePrime.ts#L64)

Validates prime generation request constraints.

## Parameters

### size

`number`

Prime size.

### sizeType

[`PrimeSizeType`](../../../../../types/numberTheory/type-aliases/PrimeSizeType.md)

Size unit.

### count?

`number` = `1`

Number of primes requested.

## Returns

`string` \| `null`

Error message when invalid, otherwise null.
