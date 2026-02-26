[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/crypto](../README.md) / parseCiphertextInputToDecimal

# Function: parseCiphertextInputToDecimal()

> **parseCiphertextInputToDecimal**(`ciphertext`, `format`): `string`

Defined in: [src/utils/numberTheory/rsa/crypto.ts:190](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/crypto.ts#L190)

Parses formatted ciphertext input into whitespace-separated decimal blocks.

Accepts:
- decimal blocks (`"123 456"`)
- hex lines/tokens (`"0A FF"` or one block per line)
- Base64/Base64URL tokens

## Parameters

### ciphertext

`string`

Raw ciphertext input.

### format

[`RsaCiphertextFormat`](../../../../../types/rsa/type-aliases/RsaCiphertextFormat.md)

Input format.

## Returns

`string`

Decimal block string for internal RSA math.

## Throws

If token parsing fails.

## Example

```ts
parseCiphertextInputToDecimal('0A FF', 'hex')
```
