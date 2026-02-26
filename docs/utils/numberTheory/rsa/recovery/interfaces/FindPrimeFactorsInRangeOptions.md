[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/rsa/recovery](../README.md) / FindPrimeFactorsInRangeOptions

# Interface: FindPrimeFactorsInRangeOptions

Defined in: [src/utils/numberTheory/rsa/recovery.ts:51](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/recovery.ts#L51)

Options for wheel-scan factor search over a bounded range.

 FindPrimeFactorsInRangeOptions

## Properties

### endExclusive

> **endExclusive**: `bigint` \| `null`

Defined in: [src/utils/numberTheory/rsa/recovery.ts:54](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/recovery.ts#L54)

Exclusive scan end, or null for unbounded.

***

### heartbeatBatchSize?

> `optional` **heartbeatBatchSize**: `number`

Defined in: [src/utils/numberTheory/rsa/recovery.ts:56](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/recovery.ts#L56)

Callback interval in attempted divisors.

***

### n

> **n**: `bigint`

Defined in: [src/utils/numberTheory/rsa/recovery.ts:52](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/recovery.ts#L52)

Target composite modulus.

***

### onHeartbeat()

> **onHeartbeat**: (`attempts`) => `void`

Defined in: [src/utils/numberTheory/rsa/recovery.ts:55](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/recovery.ts#L55)

Progress callback.

#### Parameters

##### attempts

`number`

#### Returns

`void`

***

### startInclusive

> **startInclusive**: `bigint`

Defined in: [src/utils/numberTheory/rsa/recovery.ts:53](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/rsa/recovery.ts#L53)

Inclusive scan start.
