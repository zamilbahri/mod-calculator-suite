[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/recovery](../README.md) / runRsaRecoveryPrechecks

# Function: runRsaRecoveryPrechecks()

> **runRsaRecoveryPrechecks**(`options`): [`RsaFactorPair`](../type-aliases/RsaFactorPair.md) \| `null`

Defined in: [src/utils/numberTheory/rsa/recovery.ts:226](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/recovery.ts#L226)

Runs fast factor prechecks before expensive scans.

## Parameters

### options

[`RunRsaRecoveryPrechecksOptions`](../interfaces/RunRsaRecoveryPrechecksOptions.md)

Precheck options.

## Returns

[`RsaFactorPair`](../type-aliases/RsaFactorPair.md) \| `null`

Factor pair when detected, otherwise null.
