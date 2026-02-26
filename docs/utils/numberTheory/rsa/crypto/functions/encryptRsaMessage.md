[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/crypto](../README.md) / encryptRsaMessage

# Function: encryptRsaMessage()

> **encryptRsaMessage**(`options`): `string`[]

Defined in: [src/utils/numberTheory/rsa/crypto.ts:355](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/crypto.ts#L355)

Encrypts plaintext message into decimal RSA ciphertext blocks.

## Parameters

### options

[`EncryptRsaMessageOptions`](../interfaces/EncryptRsaMessageOptions.md)

Encryption options.

## Returns

`string`[]

Decimal ciphertext blocks.

## Throws

For invalid alphabet data, invalid key constraints, or block-size violations.

## Example

```ts
encryptRsaMessage({
  message: 'HELLO',
  e: 65537n,
  n: 999630013489n,
  encodingMode: 'radix',
  blockSize: 2,
  encoding,
})
```
