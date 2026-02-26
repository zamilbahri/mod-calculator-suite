[**mod-calculator-suite v0.0.0**](../../../../../README.md)

***

[mod-calculator-suite](../../../../../modules.md) / [utils/numberTheory/primality/millerRabin](../README.md) / millerRabinErrorProbabilityExponent

# Function: millerRabinErrorProbabilityExponent()

> **millerRabinErrorProbabilityExponent**(`iterations`): `number`

Defined in: [src/utils/numberTheory/primality/millerRabin.ts:92](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/primality/millerRabin.ts#L92)

Returns the Miller-Rabin false-prime bound exponent.

For `t` rounds, error is bounded by approximately `2^(-2t)`.

## Parameters

### iterations

`number`

Number of rounds.

## Returns

`number`

Exponent in `2^-k`.
