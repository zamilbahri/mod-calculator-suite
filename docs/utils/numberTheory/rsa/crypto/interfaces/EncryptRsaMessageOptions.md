[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/crypto](../README.md) / EncryptRsaMessageOptions

# Interface: EncryptRsaMessageOptions

Defined in: [src/utils/numberTheory/rsa/crypto.ts:42](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/crypto.ts#L42)

Inputs required to encrypt RSA plaintext.

 EncryptRsaMessageOptions

## Properties

### blockSize

> **blockSize**: `number`

Defined in: [src/utils/numberTheory/rsa/crypto.ts:47](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/crypto.ts#L47)

Symbols (or digits) per block.

***

### e

> **e**: `bigint`

Defined in: [src/utils/numberTheory/rsa/crypto.ts:44](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/crypto.ts#L44)

Public exponent.

***

### encoding

> **encoding**: [`AlphabetEncoding`](../../encoding/type-aliases/AlphabetEncoding.md)

Defined in: [src/utils/numberTheory/rsa/crypto.ts:48](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/crypto.ts#L48)

Alphabet mapping.

***

### encodingMode

> **encodingMode**: [`RsaEncodingMode`](../../../../../types/rsa/type-aliases/RsaEncodingMode.md)

Defined in: [src/utils/numberTheory/rsa/crypto.ts:46](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/crypto.ts#L46)

Text encoding mode.

***

### message

> **message**: `string`

Defined in: [src/utils/numberTheory/rsa/crypto.ts:43](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/crypto.ts#L43)

Plaintext message.

***

### n

> **n**: `bigint`

Defined in: [src/utils/numberTheory/rsa/crypto.ts:45](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/crypto.ts#L45)

RSA modulus.
