[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/crypto](../README.md) / resolveRsaBlockSize

# Function: resolveRsaBlockSize()

> **resolveRsaBlockSize**(`options`): `number`

Defined in: [src/utils/numberTheory/rsa/crypto.ts:261](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/crypto.ts#L261)

Resolves effective block size from input and mode defaults.

In fixed-width mode, blank input defaults to `defaultBlockSize * 2`
because each symbol consumes two digits.

## Parameters

### options

[`ResolveRsaBlockSizeOptions`](../interfaces/ResolveRsaBlockSizeOptions.md)

Block size options.

## Returns

`number`

Positive integer block size.

## Throws

If parsed block size is not a positive integer.
