[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/primality/checkPrime](../README.md) / primalityCheck

# Function: primalityCheck()

> **primalityCheck**(`n`, `options?`): [`PrimalityCheckResult`](../../../../../types/numberTheory/interfaces/PrimalityCheckResult.md)

Defined in: [src/utils/numberTheory/primality/checkPrime.ts:36](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/primality/checkPrime.ts#L36)

Runs primality checks with method selection and confidence metadata.

Selection rules:
- `Auto`: small-prime precheck, then BPSW for `n < 2^64`, otherwise Miller-Rabin.
- `Baillie-PSW`: forces BPSW after small-prime precheck.
- `Miller-Rabin`: forces randomized Miller-Rabin after small-prime precheck.

Verdict semantics:
- `Prime`: deterministically resolved by small-prime checks or BPSW in `< 2^64` range.
- `Probably Prime`: probabilistic result.
- `Composite`: witness or factor found.

`errorProbabilityExponent = k` corresponds to an upper bound of about `2^-k`
for false-prime classification in Miller-Rabin mode.

## Parameters

### n

`bigint`

Integer to test.

### options?

Method options or round count shortcut.

`number` | [`PrimalityCheckOptions`](../../../../../types/numberTheory/interfaces/PrimalityCheckOptions.md)

## Returns

[`PrimalityCheckResult`](../../../../../types/numberTheory/interfaces/PrimalityCheckResult.md)

Structured primality result.
