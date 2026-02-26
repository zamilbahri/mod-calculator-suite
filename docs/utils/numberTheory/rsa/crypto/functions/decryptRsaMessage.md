[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/crypto](../README.md) / decryptRsaMessage

# Function: decryptRsaMessage()

> **decryptRsaMessage**(`options`): `string`

Defined in: [src/utils/numberTheory/rsa/crypto.ts:479](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/crypto.ts#L479)

Decrypts decimal RSA ciphertext blocks into plaintext.

## Parameters

### options

[`DecryptRsaMessageOptions`](../interfaces/DecryptRsaMessageOptions.md)

Decryption options.

## Returns

`string`

Decoded plaintext.

## Throws

If ciphertext is malformed or symbol decoding fails.
