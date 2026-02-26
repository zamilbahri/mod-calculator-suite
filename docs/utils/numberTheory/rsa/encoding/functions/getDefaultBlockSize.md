[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/encoding](../README.md) / getDefaultBlockSize

# Function: getDefaultBlockSize()

> **getDefaultBlockSize**(`n`, `radix`): `number`

Defined in: [src/utils/numberTheory/rsa/encoding.ts:136](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/encoding.ts#L136)

Computes the largest block length `k` such that `radix^k <= n`.

## Parameters

### n

`bigint`

RSA modulus.

### radix

`bigint`

Encoding radix.

## Returns

`number`

Safe default symbol block size.
