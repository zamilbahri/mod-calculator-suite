# Gemini Context: Modular Calculator Suite

This project is a React-based toolkit for modular number theory and common cryptography tasks. It is designed for both convenience and as an educational tool for cryptography students.

## Project Overview

-   **Purpose:** A suite of calculators for RSA, Primes, Modular Arithmetic, Modular Matrix operations, and Galois Fields.
-   **Main Technologies:**
    -   **Frontend:** React 19 (TypeScript), Vite, Tailwind CSS v4.
    -   **Math Rendering:** KaTeX (via `MathText` component) for LaTeX support.
    -   **Computations:** Native `BigInt` for high-precision arithmetic, and binary/polynomial arithmetic for Galois Fields.
    -   **Performance:** Web Workers for heavy computations (RSA factor recovery, prime generation).
-   **Architecture:**
    -   `src/App.tsx`: Layout and group organization of calculators.
    -   `src/components/calculators/`: Individual calculator UI components.
    -   `src/utils/numberTheory/`: Modularized math logic (EGCD, CRT, primality, RSA, Matrix ops, and Galois Fields).
    -   `src/workers/`: Worker scripts for non-blocking UI during expensive tasks.
    -   `src/types/`: Shared TypeScript interfaces and types.

## Building and Running

-   **Install Dependencies:** `npm install`
-   **Development Server:** `npm run dev` (Starts Vite dev server)
-   **Production Build:** `npm run build` (Runs `tsc` and `vite build`)
-   **Run Tests:** `npm run test` (Uses Node.js built-in test runner with `tsx`)
-   **Linting:** `npm run lint` (ESLint with TypeScript support)
-   **Deployment:** `npm run deploy` (Builds and pushes to GitHub Pages)

## Development Conventions

-   **BigInt Usage:** Always use `BigInt` for numbers that might exceed $2^{53}-1$. Utility functions in `src/utils/numberTheory/` are built around `BigInt`.
-   **Component Structure:**
    -   Calculators are wrapped in `CalculatorCard` for a consistent collapsible UI.
    -   Math expressions should be rendered using the `MathText` component.
-   **Modularity:**
    -   Logic is decoupled from UI. UI components should import logic from the barrel export at `src/utils/numberTheory/index.ts`.
    -   Expensive operations (e.g., long-running loops) should be offloaded to Web Workers in `src/workers/`.
-   **Testing:** New mathematical utilities MUST include tests in `src/utils/*.test.ts`. Use the `node --test` runner.
-   **Styling:** Use Tailwind CSS v4 classes for styling. Avoid custom CSS where possible.
-   **KaTeX:** When using `MathText`, remember to escape backslashes in template literals (e.g., `\\pmod{n}`). Truncation of large numbers in math rendering is handled automatically by `MathText` (default 12 digits).
