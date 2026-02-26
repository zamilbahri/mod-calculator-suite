[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/encoding](../README.md) / buildAlphabetEncoding

# Function: buildAlphabetEncoding()

> **buildAlphabetEncoding**(`options`): [`AlphabetEncoding`](../type-aliases/AlphabetEncoding.md)

Defined in: [src/utils/numberTheory/rsa/encoding.ts:73](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/encoding.ts#L73)

Builds alphabet encoding tables for RSA text modes.

## Parameters

### options

[`BuildAlphabetEncodingOptions`](../interfaces/BuildAlphabetEncodingOptions.md)

Encoding construction options.

## Returns

[`AlphabetEncoding`](../type-aliases/AlphabetEncoding.md)

Bidirectional alphabet mapping.

## Throws

If custom alphabet is empty, non-ASCII, or contains duplicates.

## Example

```ts
buildAlphabetEncoding({
  alphabetMode: 'custom',
  customAlphabet: 'ABCXYZ',
  customIgnoreCase: true,
  customOffset: '0',
})
```
