[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/pem](../README.md) / RsaPublicPemExportOptions

# Interface: RsaPublicPemExportOptions

Defined in: [src/utils/numberTheory/rsa/pem.ts:62](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/pem.ts#L62)

Inputs for exporting only public key PEM.

 RsaPublicPemExportOptions

## Properties

### algorithmName?

> `optional` **algorithmName**: `RsaPemAlgorithmName`

Defined in: [src/utils/numberTheory/rsa/pem.ts:65](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/pem.ts#L65)

WebCrypto algorithm profile.

***

### e

> **e**: `bigint`

Defined in: [src/utils/numberTheory/rsa/pem.ts:64](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/pem.ts#L64)

Public exponent.

***

### hashName?

> `optional` **hashName**: `RsaPemHashName`

Defined in: [src/utils/numberTheory/rsa/pem.ts:66](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/pem.ts#L66)

Hash function for import params.

***

### n

> **n**: `bigint`

Defined in: [src/utils/numberTheory/rsa/pem.ts:63](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/pem.ts#L63)

RSA modulus.
