[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/encoding](../README.md) / BuildAlphabetEncodingOptions

# Interface: BuildAlphabetEncodingOptions

Defined in: [src/utils/numberTheory/rsa/encoding.ts:38](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/encoding.ts#L38)

Options for building a custom or ASCII alphabet encoding.

 BuildAlphabetEncodingOptions

## Properties

### alphabetMode

> **alphabetMode**: [`RsaAlphabetMode`](../../../../../types/rsa/type-aliases/RsaAlphabetMode.md)

Defined in: [src/utils/numberTheory/rsa/encoding.ts:39](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/encoding.ts#L39)

Encoding mode (`ascii` or custom).

***

### customAlphabet

> **customAlphabet**: `string`

Defined in: [src/utils/numberTheory/rsa/encoding.ts:40](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/encoding.ts#L40)

Custom alphabet source string.

***

### customIgnoreCase

> **customIgnoreCase**: `boolean`

Defined in: [src/utils/numberTheory/rsa/encoding.ts:41](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/encoding.ts#L41)

Whether custom matching is case-insensitive.

***

### customOffset

> **customOffset**: `string`

Defined in: [src/utils/numberTheory/rsa/encoding.ts:42](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/encoding.ts#L42)

Starting numeric offset for the first symbol.
