[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/pem](../README.md) / RsaPemExportOptions

# Interface: RsaPemExportOptions

Defined in: [src/utils/numberTheory/rsa/pem.ts:36](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/pem.ts#L36)

Inputs for exporting both public and private PEM keys.

 RsaPemExportOptions

## Extends

- [`RsaPrivateKeyComponents`](RsaPrivateKeyComponents.md)

## Properties

### algorithmName?

> `optional` **algorithmName**: `RsaPemAlgorithmName`

Defined in: [src/utils/numberTheory/rsa/pem.ts:37](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/pem.ts#L37)

WebCrypto algorithm profile.

***

### d

> **d**: `bigint`

Defined in: [src/utils/numberTheory/rsa/pem.ts:25](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/pem.ts#L25)

Private exponent.

#### Inherited from

[`RsaPrivateKeyComponents`](RsaPrivateKeyComponents.md).[`d`](RsaPrivateKeyComponents.md#d)

***

### e

> **e**: `bigint`

Defined in: [src/utils/numberTheory/rsa/pem.ts:24](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/pem.ts#L24)

Public exponent.

#### Inherited from

[`RsaPrivateKeyComponents`](RsaPrivateKeyComponents.md).[`e`](RsaPrivateKeyComponents.md#e)

***

### hashName?

> `optional` **hashName**: `RsaPemHashName`

Defined in: [src/utils/numberTheory/rsa/pem.ts:38](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/pem.ts#L38)

Hash function for import params.

***

### n?

> `optional` **n**: `bigint`

Defined in: [src/utils/numberTheory/rsa/pem.ts:26](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/pem.ts#L26)

Optional modulus, derived from `p*q` when omitted.

#### Inherited from

[`RsaPrivateKeyComponents`](RsaPrivateKeyComponents.md).[`n`](RsaPrivateKeyComponents.md#n)

***

### p

> **p**: `bigint`

Defined in: [src/utils/numberTheory/rsa/pem.ts:22](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/pem.ts#L22)

Prime factor `p`.

#### Inherited from

[`RsaPrivateKeyComponents`](RsaPrivateKeyComponents.md).[`p`](RsaPrivateKeyComponents.md#p)

***

### q

> **q**: `bigint`

Defined in: [src/utils/numberTheory/rsa/pem.ts:23](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/pem.ts#L23)

Prime factor `q`.

#### Inherited from

[`RsaPrivateKeyComponents`](RsaPrivateKeyComponents.md).[`q`](RsaPrivateKeyComponents.md#q)
