[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/keyMath](../README.md) / selectDefaultPublicExponent

# Function: selectDefaultPublicExponent()

> **selectDefaultPublicExponent**(`phi`): `bigint` \| `undefined`

Defined in: [src/utils/numberTheory/rsa/keyMath.ts:75](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/keyMath.ts#L75)

Selects a safe default public exponent for a given totient.

## Parameters

### phi

`bigint`

Euler totient.

## Returns

`bigint` \| `undefined`

First valid default exponent, if any.
