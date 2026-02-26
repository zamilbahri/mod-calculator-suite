[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/crypto](../README.md) / DecryptRsaMessageOptions

# Interface: DecryptRsaMessageOptions

Defined in: [src/utils/numberTheory/rsa/crypto.ts:62](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/crypto.ts#L62)

Inputs required to decrypt RSA ciphertext.

 DecryptRsaMessageOptions

## Properties

### blockSize

> **blockSize**: `number`

Defined in: [src/utils/numberTheory/rsa/crypto.ts:67](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/crypto.ts#L67)

Symbols (or digits) per block.

***

### ciphertext

> **ciphertext**: `string`

Defined in: [src/utils/numberTheory/rsa/crypto.ts:63](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/crypto.ts#L63)

Decimal ciphertext blocks separated by whitespace.

***

### d

> **d**: `bigint`

Defined in: [src/utils/numberTheory/rsa/crypto.ts:64](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/crypto.ts#L64)

Private exponent.

***

### encoding

> **encoding**: [`AlphabetEncoding`](../../encoding/type-aliases/AlphabetEncoding.md)

Defined in: [src/utils/numberTheory/rsa/crypto.ts:68](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/crypto.ts#L68)

Alphabet mapping.

***

### encodingMode

> **encodingMode**: [`RsaEncodingMode`](../../../../../types/rsa/type-aliases/RsaEncodingMode.md)

Defined in: [src/utils/numberTheory/rsa/crypto.ts:66](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/crypto.ts#L66)

Text encoding mode.

***

### n

> **n**: `bigint`

Defined in: [src/utils/numberTheory/rsa/crypto.ts:65](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/crypto.ts#L65)

RSA modulus.
