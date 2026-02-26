[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/keyMath](../README.md) / computeQInverseModP

# Function: computeQInverseModP()

> **computeQInverseModP**(`q`, `p`): `bigint`

Defined in: [src/utils/numberTheory/rsa/keyMath.ts:56](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/keyMath.ts#L56)

Computes CRT coefficient `q^{-1} mod p`.

## Parameters

### q

`bigint`

Prime factor `q`.

### p

`bigint`

Prime factor `p`.

## Returns

`bigint`

Multiplicative inverse of `q` modulo `p`.
