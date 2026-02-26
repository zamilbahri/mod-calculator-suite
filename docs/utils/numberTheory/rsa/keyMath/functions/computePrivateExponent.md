[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/keyMath](../README.md) / computePrivateExponent

# Function: computePrivateExponent()

> **computePrivateExponent**(`e`, `phi`): `bigint`

Defined in: [src/utils/numberTheory/rsa/keyMath.ts:88](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/keyMath.ts#L88)

Computes private exponent `d = e^{-1} mod phi`.

## Parameters

### e

`bigint`

Public exponent.

### phi

`bigint`

Euler totient.

## Returns

`bigint`

Private exponent.

## Throws

If inverse does not exist.
