[**mod-calculator-suite v0.0.0**](../../../../README.md)

***

[mod-calculator-suite](../../../../modules.md) / [utils/numberTheory/core](../README.md) / extendedGCD

# Function: extendedGCD()

> **extendedGCD**(`a`, `b`): [`EGCDResult`](../../../../types/numberTheory/interfaces/EGCDResult.md)

Defined in: [src/utils/numberTheory/core.ts:51](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/core.ts#L51)

Computes extended gcd coefficients for Bézout's identity.

Returns `{ gcd, x, y }` such that `a*x + b*y = gcd`.

## Parameters

### a

`bigint`

First integer.

### b

`bigint`

Second integer.

## Returns

[`EGCDResult`](../../../../types/numberTheory/interfaces/EGCDResult.md)

Extended gcd result.
