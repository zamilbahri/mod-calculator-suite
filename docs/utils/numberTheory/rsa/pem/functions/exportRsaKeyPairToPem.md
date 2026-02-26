[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/pem](../README.md) / exportRsaKeyPairToPem

# Function: exportRsaKeyPairToPem()

> **exportRsaKeyPairToPem**(`options`): `Promise`\<[`RsaPemExportResult`](../interfaces/RsaPemExportResult.md)\>

Defined in: [src/utils/numberTheory/rsa/pem.ts:180](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/pem.ts#L180)

Exports an RSA key pair to PEM strings.

## Parameters

### options

[`RsaPemExportOptions`](../interfaces/RsaPemExportOptions.md)

RSA components and optional WebCrypto profile.

## Returns

`Promise`\<[`RsaPemExportResult`](../interfaces/RsaPemExportResult.md)\>

PEM-encoded private/public key pair.

## Throws

If WebCrypto is unavailable or import/export operations fail.
