# Modular Calculator Suite

A React + TypeScript toolkit of calculators for modular number theory and common cryptography tasks. Made for convenience and for reinforcing concepts from a Master’s cryptography course.

## Calculator Overview (in UI order)

### RSA and Primes

1. **RSA Calculator**
   - Supports RSA encryption/decryption with configurable key inputs and key derivation tools.
   - Implemented encoding modes:
     - Fixed-width numeric slicing
     - Radix (b-adic) packing
     - PKCS#1 v1.5 padding
   - Includes a **Recover primes** decryption option for moduli where `N < 2^72`.
     - Prime recovery is multithreaded and uses up to two web workers.
     - Before worker scans begin, divisibility is prechecked for small prime factors up to and including `997`.
     - For an `n`-bit RSA modulus `N`, the worker ranges are split as:
       - `balanced`: from `max(nextPrimeAfterPrecheck, 2^(floor(n/2)-1))` (inclusive) to `floor(sqrt(N)) + 1` (exclusive), where `nextPrimeAfterPrecheck` is currently `1009`.
       - `low`: from `nextPrimeAfterPrecheck` (inclusive) to `max(nextPrimeAfterPrecheck, 2^(floor(n/2)-1))` (exclusive).

2. **Prime Generator**
   - Generates probable primes by bit size or digit size.
   - Supports generation of up to 10 primes, with count limits by size policy:

   | Max Prime Size (bits) | Max Count | Warning Starts At |
   | --------------------- | --------- | ----------------- |
   | 1536                  | 10        | 11 (No warning)   |
   | 2048                  | 10        | 5                 |
   | 3072                  | 4         | 2                 |
   | 4096                  | 4         | 1                 |
   - Prime generation is multithreaded, and the user can set the number of worker threads.

3. **Prime Checker**
   - Uses Baillie-PSW and Miller-Rabin primality testing.
   - For `n < 2^72`, Baillie-PSW is used.
   - For larger values, Miller-Rabin is used with a default of 24 rounds.
   - The user can configure the number of Miller-Rabin rounds.

### Modular Number Theory

1. **EGCD and Modular Inverse Calculator**
   - Computes `gcd(a, b)`, Bézout coefficients, and modular inverses.

2. **Fast Exponentiation**
   - Computes `a^n mod m` using square-and-multiply.

3. **CRT Solver**
   - Solves systems of congruences with pairwise coprime moduli.

### Modular Matrix Utilities

1. **Matrix Modular Determinant, RREF, and Inverse Calculator**
   - Normalizes a matrix `A mod m`, and computes `det(A) mod m`, `RREF(A) mod m`, and `A^-1 mod m`.

1. **Matrix Multiplcation Caluclator**
   - Calculates the product of two matrices `A x B mod m`.

## Development

### Requirements

- Node.js 20+
- npm

### Install

```bash
npm install
```

### Run (dev server)

```bash
npm run dev
```

### Build

```bash
npm run build
```
