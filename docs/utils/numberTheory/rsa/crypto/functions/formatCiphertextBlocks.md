[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/crypto](../README.md) / formatCiphertextBlocks

# Function: formatCiphertextBlocks()

> **formatCiphertextBlocks**(`blocks`, `format`): `string`

Defined in: [src/utils/numberTheory/rsa/crypto.ts:160](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/crypto.ts#L160)

Formats decimal ciphertext blocks into selected external format.

## Parameters

### blocks

readonly `string`[]

Decimal ciphertext blocks.

### format

[`RsaCiphertextFormat`](../../../../../types/rsa/type-aliases/RsaCiphertextFormat.md)

Target output format.

## Returns

`string`

Serialized ciphertext.

## Example

```ts
formatCiphertextBlocks(['12345', '999'], 'hex')
```
