[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/primality/millerRabin](../README.md) / isMillerRabinProbablePrime

# Function: isMillerRabinProbablePrime()

> **isMillerRabinProbablePrime**(`n`, `iterations?`): `object`

Defined in: [src/utils/numberTheory/primality/millerRabin.ts:56](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/primality/millerRabin.ts#L56)

Runs Miller-Rabin with randomized unique bases.

## Parameters

### n

`bigint`

Candidate integer.

### iterations?

`number` = `24`

Number of rounds.

## Returns

`object`

Result and witness for composite findings.

### isProbablePrime

> **isProbablePrime**: `boolean`

### witness?

> `optional` **witness**: `bigint`
