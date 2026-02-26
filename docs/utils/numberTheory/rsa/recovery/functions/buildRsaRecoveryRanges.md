[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/recovery](../README.md) / buildRsaRecoveryRanges

# Function: buildRsaRecoveryRanges()

> **buildRsaRecoveryRanges**(`n`, `trialUpperExclusive`): [`RsaRecoveryRange`](../type-aliases/RsaRecoveryRange.md)[]

Defined in: [src/utils/numberTheory/rsa/recovery.ts:276](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/recovery.ts#L276)

Builds two complementary scan ranges for parallel recovery workers.

`balanced` scans near expected balanced factors, while `low` covers smaller divisors.

## Parameters

### n

`bigint`

Target modulus.

### trialUpperExclusive

`bigint`

Exclusive upper bound for trial division.

## Returns

[`RsaRecoveryRange`](../type-aliases/RsaRecoveryRange.md)[]

Worker range assignments.
