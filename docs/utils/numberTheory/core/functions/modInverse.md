[**mod-calculator-suite v0.0.0**](../../../../README.md)

***

[mod-calculator-suite](../../../../modules.md) / [utils/numberTheory/core](../README.md) / modInverse

# Function: modInverse()

> **modInverse**(`a`, `m`): `bigint`

Defined in: [src/utils/numberTheory/core.ts:126](https://github.com/zamilbahri/mod-calculator-suite/blob/2f2122262b150cd50415b3faadc5f6a8ef538e1a/src/utils/numberTheory/core.ts#L126)

Computes the multiplicative inverse of `a` modulo `m`.

## Parameters

### a

`bigint`

Value to invert.

### m

`bigint`

Modulus (must be non-zero).

## Returns

`bigint`

`x` such that `(a * x) mod m = 1`.

## Throws

If `m === 0` or if `gcd(a, m) !== 1`.

## Example

```ts
modInverse(3n, 11n) // 4n
```
