[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/encoding](../README.md) / AlphabetEncoding

# Type Alias: AlphabetEncoding

> **AlphabetEncoding** = `object`

Defined in: [src/utils/numberTheory/rsa/encoding.ts:22](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/encoding.ts#L22)

Bidirectional symbol encoding definition for RSA text packing.

## Properties

### charToValue

> **charToValue**: `Map`\<`string`, `bigint`\>

Defined in: [src/utils/numberTheory/rsa/encoding.ts:25](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/encoding.ts#L25)

Character to numeric symbol map.

***

### normalizeChar()

> **normalizeChar**: (`ch`) => `string`

Defined in: [src/utils/numberTheory/rsa/encoding.ts:24](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/encoding.ts#L24)

Character normalization function.

#### Parameters

##### ch

`string`

#### Returns

`string`

***

### radix

> **radix**: `bigint`

Defined in: [src/utils/numberTheory/rsa/encoding.ts:23](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/encoding.ts#L23)

Numeric base used when packing symbols into blocks.

***

### valueToChar

> **valueToChar**: `Map`\<`bigint`, `string`\>

Defined in: [src/utils/numberTheory/rsa/encoding.ts:26](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/encoding.ts#L26)

Numeric symbol to character map.
