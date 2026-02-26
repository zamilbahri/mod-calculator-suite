[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/primality/millerRabin](../README.md) / isStrongProbablePrimeForBase

# Function: isStrongProbablePrimeForBase()

> **isStrongProbablePrimeForBase**(`n`, `aIn`): `boolean`

Defined in: [src/utils/numberTheory/primality/millerRabin.ts:30](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/primality/millerRabin.ts#L30)

Runs a strong probable-prime test for a single base.

## Parameters

### n

`bigint`

Candidate integer.

### aIn

`bigint`

Witness base.

## Returns

`boolean`

`true` if `n` passes for this base.
