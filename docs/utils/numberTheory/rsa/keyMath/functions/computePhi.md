[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/keyMath](../README.md) / computePhi

# Function: computePhi()

> **computePhi**(`p`, `q`): `bigint`

Defined in: [src/utils/numberTheory/rsa/keyMath.ts:33](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/keyMath.ts#L33)

Computes Euler's totient for RSA modulus.

## Parameters

### p

`bigint`

Prime factor `p`.

### q

`bigint`

Prime factor `q`.

## Returns

`bigint`

`phi(n) = (p - 1)(q - 1)`.
