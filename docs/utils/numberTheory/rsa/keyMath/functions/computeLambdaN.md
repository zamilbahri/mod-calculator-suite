[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/keyMath](../README.md) / computeLambdaN

# Function: computeLambdaN()

> **computeLambdaN**(`p`, `q`): `bigint`

Defined in: [src/utils/numberTheory/rsa/keyMath.ts:43](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/keyMath.ts#L43)

Computes Carmichael's lambda for RSA modulus.

## Parameters

### p

`bigint`

Prime factor `p`.

### q

`bigint`

Prime factor `q`.

## Returns

`bigint`

`lambda(n) = lcm(p-1, q-1)`.
