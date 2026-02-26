[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/pem](../README.md) / RsaPrivateKeyComponents

# Interface: RsaPrivateKeyComponents

Defined in: [src/utils/numberTheory/rsa/pem.ts:21](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/pem.ts#L21)

Core RSA private-key numeric components.

 RsaPrivateKeyComponents

## Extended by

- [`RsaPemExportOptions`](RsaPemExportOptions.md)

## Properties

### d

> **d**: `bigint`

Defined in: [src/utils/numberTheory/rsa/pem.ts:25](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/pem.ts#L25)

Private exponent.

***

### e

> **e**: `bigint`

Defined in: [src/utils/numberTheory/rsa/pem.ts:24](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/pem.ts#L24)

Public exponent.

***

### n?

> `optional` **n**: `bigint`

Defined in: [src/utils/numberTheory/rsa/pem.ts:26](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/pem.ts#L26)

Optional modulus, derived from `p*q` when omitted.

***

### p

> **p**: `bigint`

Defined in: [src/utils/numberTheory/rsa/pem.ts:22](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/pem.ts#L22)

Prime factor `p`.

***

### q

> **q**: `bigint`

Defined in: [src/utils/numberTheory/rsa/pem.ts:23](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/pem.ts#L23)

Prime factor `q`.
