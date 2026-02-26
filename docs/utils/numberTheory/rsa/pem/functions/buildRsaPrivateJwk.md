[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/pem](../README.md) / buildRsaPrivateJwk

# Function: buildRsaPrivateJwk()

> **buildRsaPrivateJwk**(`components`): `JsonWebKey`

Defined in: [src/utils/numberTheory/rsa/pem.ts:128](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/pem.ts#L128)

Builds a private RSA JWK including CRT parameters.

## Parameters

### components

[`RsaPrivateKeyComponents`](../interfaces/RsaPrivateKeyComponents.md)

Private key components.

## Returns

`JsonWebKey`

Private JWK with CRT fields.

## Throws

If RSA parameters produce invalid `lambda(n)`.
