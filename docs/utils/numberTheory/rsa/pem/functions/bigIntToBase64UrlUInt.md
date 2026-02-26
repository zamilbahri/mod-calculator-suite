[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/pem](../README.md) / bigIntToBase64UrlUInt

# Function: bigIntToBase64UrlUInt()

> **bigIntToBase64UrlUInt**(`value`): `string`

Defined in: [src/utils/numberTheory/rsa/pem.ts:102](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/pem.ts#L102)

Encodes a non-negative bigint as unsigned Base64URL integer.

## Parameters

### value

`bigint`

RSA integer component.

## Returns

`string`

Base64URL-encoded unsigned integer.

## Throws

If `value < 0`.
