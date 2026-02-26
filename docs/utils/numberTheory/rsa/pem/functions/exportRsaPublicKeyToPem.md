[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/pem](../README.md) / exportRsaPublicKeyToPem

# Function: exportRsaPublicKeyToPem()

> **exportRsaPublicKeyToPem**(`options`): `Promise`\<`string`\>

Defined in: [src/utils/numberTheory/rsa/pem.ts:240](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/pem.ts#L240)

Exports an RSA public key to PEM.

## Parameters

### options

[`RsaPublicPemExportOptions`](../interfaces/RsaPublicPemExportOptions.md)

Public components and optional WebCrypto profile.

## Returns

`Promise`\<`string`\>

SPKI public key PEM.

## Throws

If WebCrypto is unavailable or import/export operations fail.
