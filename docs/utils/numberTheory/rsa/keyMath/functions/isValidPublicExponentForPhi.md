[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/keyMath](../README.md) / isValidPublicExponentForPhi

# Function: isValidPublicExponentForPhi()

> **isValidPublicExponentForPhi**(`e`, `phi`): `boolean`

Defined in: [src/utils/numberTheory/rsa/keyMath.ts:66](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/keyMath.ts#L66)

Validates candidate public exponent against `phi(n)`.

## Parameters

### e

`bigint`

Candidate public exponent.

### phi

`bigint`

Euler totient.

## Returns

`boolean`

`true` when `1 < e < phi` and `gcd(e, phi) = 1`.
