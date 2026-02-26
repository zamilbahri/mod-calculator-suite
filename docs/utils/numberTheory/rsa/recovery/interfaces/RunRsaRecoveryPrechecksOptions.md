[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/recovery](../README.md) / RunRsaRecoveryPrechecksOptions

# Interface: RunRsaRecoveryPrechecksOptions

Defined in: [src/utils/numberTheory/rsa/recovery.ts:69](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/recovery.ts#L69)

Options for fast factor prechecks before long scans.

 RunRsaRecoveryPrechecksOptions

## Properties

### n

> **n**: `bigint`

Defined in: [src/utils/numberTheory/rsa/recovery.ts:70](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/recovery.ts#L70)

Target modulus.

***

### pCandidate?

> `optional` **pCandidate**: `bigint` \| `null`

Defined in: [src/utils/numberTheory/rsa/recovery.ts:72](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/recovery.ts#L72)

Optional known/guessed `p`.

***

### qCandidate?

> `optional` **qCandidate**: `bigint` \| `null`

Defined in: [src/utils/numberTheory/rsa/recovery.ts:73](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/recovery.ts#L73)

Optional known/guessed `q`.

***

### quickPrecheckPrimes?

> `optional` **quickPrecheckPrimes**: readonly `bigint`[]

Defined in: [src/utils/numberTheory/rsa/recovery.ts:74](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/recovery.ts#L74)

Additional small primes to test.

***

### sqrtN

> **sqrtN**: `bigint`

Defined in: [src/utils/numberTheory/rsa/recovery.ts:71](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/recovery.ts#L71)

Integer square root of `n`.
