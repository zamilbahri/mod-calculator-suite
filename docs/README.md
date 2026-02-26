**mod-calculator-suite v0.0.0**

***

# Modular Calculator Suite

A React + TypeScript calculator suite for RSA workflows and modular number theory operations.

## Calculator Overview (in UI order)

### RSA and Primes

1. **RSA Calculator**
   - Supports RSA encryption/decryption with configurable key inputs and key derivation tools.
   - Implemented encoding modes:
     - Fixed-width numeric slicing
     - Radix (b-adic) packing
     - PKCS#1 v1.5 padding
   - Includes a **Recover primes** decryption option for moduli where `n < 2^72`.

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
   - For `n < 2^64`, Baillie-PSW is used.
   - For larger values, Miller-Rabin is used with a default of 24 rounds.
   - The user can configure the number of Miller-Rabin rounds.

### Modular Number Theory

1. **EGCD and Modular Inverse Calculator**
   - Computes `gcd(a, b)`, Bézout coefficients, and modular inverses.

2. **Fast Exponentiation**
   - Computes `a^n mod m` using square-and-multiply.

3. **CRT Solver**
   - Solves systems of congruences with pairwise coprime moduli.

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
