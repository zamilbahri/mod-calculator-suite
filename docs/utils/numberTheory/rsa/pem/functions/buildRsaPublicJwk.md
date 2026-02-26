[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/pem](../README.md) / buildRsaPublicJwk

# Function: buildRsaPublicJwk()

> **buildRsaPublicJwk**(`n`, `e`): `JsonWebKey`

Defined in: [src/utils/numberTheory/rsa/pem.ts:114](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/pem.ts#L114)

Builds a public RSA JWK from modulus and exponent.

## Parameters

### n

`bigint`

RSA modulus.

### e

`bigint`

Public exponent.

## Returns

`JsonWebKey`

Public JWK.
