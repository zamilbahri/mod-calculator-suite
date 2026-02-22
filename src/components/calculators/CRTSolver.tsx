import React, { useMemo, useState } from 'react';
import MathText from '../shared/MathText';
import NumericOutput from '../shared/NumericOutput';
import {
  errorBoxClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../shared/ui';
import {
  parseBigIntStrict,
  solveCRT,
  MathValidationError,
  gcd,
} from '../../utils/numberTheory';
import type {
  CRTSolution,
  CRTEquationParsed,
  CRTEquationDraft,
} from '../../types/index.ts';
import CRTInputPanel from './CRTInputPanel';
import { MathErrorView } from '../shared/MathErrorView.tsx';

const CRT_LEARN_MORE = 'https://zamilbahri.github.io/crt-solver';

/**
 * Validates the user's current draft equations in real-time.
 *
 * * This function processes the UI state to determine if the system of equations
 * is mathematically ready to be solved. It checks for partially filled rows,
 * validates that all moduli are at least 2, and verifies that the provided
 * moduli are pairwise coprime.
 *
 * * @param eqs - An array of `CRTEquationDraft` representing the current UI inputs.
 *
 * @returns An object containing:
 * - `liveErrors`: An array of `MathValidationError` instances pooling formatting/math issues.
 * - `isCoprime`: `true` if all valid moduli are pairwise coprime, `false` if any share a factor, or `null` if the inputs are incomplete.
 * - `canSolve`: `true` only if all active rows are fully filled with valid integers and moduli are coprime.
 */
function validateEquations(eqs: CRTEquationDraft[]): {
  liveErrors: MathValidationError[];
  isCoprime: boolean | null;
  canSolve: boolean;
} {
  const liveErrors: MathValidationError[] = [];

  // Filter out completely empty rows, as they are ignored by the solver
  const active = eqs.filter(
    (eq) => !(eq.a.trim() === '' && eq.m.trim() === ''),
  );

  // If no active equations exist, reset the UI state
  if (active.length === 0) {
    return { liveErrors, isCoprime: null, canSolve: false };
  }

  let canSolve = true;
  let allMValid = true;
  const moduli: { m: bigint; label: string }[] = [];
  const mLessThan2: string[] = [];

  // 1. Process each active equation for basic formatting and minimum limits
  active.forEach((eq, i) => {
    const aStr = eq.a.trim();
    const mStr = eq.m.trim();
    const label = `m_{${i + 1}}`; // Keep LaTeX formatting for UI error rendering

    // If an active row is missing either 'a' or 'm', we cannot proceed to solve
    if (aStr === '' || mStr === '') canSolve = false;

    if (mStr !== '' && /^\d+$/.test(mStr)) {
      const m = BigInt(mStr);

      // Modulus must be >= 2 for modular arithmetic
      if (m < 2n) {
        mLessThan2.push(label);
        allMValid = false;
        canSolve = false;
      } else {
        moduli.push({ m, label });
      }
    } else if (mStr !== '') {
      // If m is not empty but fails the digits regex, it's invalid
      allMValid = false;
      canSolve = false;
    }
  });

  // Pool all m < 2 errors into a single, clean message
  if (mLessThan2.length > 0) {
    liveErrors.push(
      new MathValidationError(mLessThan2, 'must be at least', '2'),
    );
  }

  let isCoprime: boolean | null = null;

  // 2. Process coprimality if we have valid moduli to check
  if (allMValid && moduli.length > 0) {
    if (moduli.length === 1) {
      // Trivial case: A single valid modulus is inherently pairwise coprime
      isCoprime = true;
    } else if (moduli.length === active.length) {
      // Multiple moduli: Only check if every active row has a successfully parsed modulus
      const nonCoprimeSet = new Set<string>();

      for (let i = 0; i < moduli.length; i++) {
        for (let j = i + 1; j < moduli.length; j++) {
          if (gcd(moduli[i].m, moduli[j].m) !== 1n) {
            nonCoprimeSet.add(moduli[i].label);
            nonCoprimeSet.add(moduli[j].label);
          }
        }
      }

      if (nonCoprimeSet.size > 0) {
        isCoprime = false;
        canSolve = false;
        // Pool all conflicting moduli into a single error message
        liveErrors.push(
          new MathValidationError(
            Array.from(nonCoprimeSet),
            'are not pairwise coprime',
          ),
        );
      } else {
        isCoprime = true;
      }
    }
  }

  return { liveErrors, isCoprime, canSolve };
}

const CRTSolver: React.FC = () => {
  const [equations, setEquations] = useState<CRTEquationDraft[]>([
    { a: '', m: '' },
    { a: '', m: '' },
    { a: '', m: '' },
  ]);

  const [working, setWorking] = useState(false);
  const [error, setError] = useState<React.ReactNode>(null);
  const [solution, setSolution] = useState<CRTSolution | null>(null);

  const validation = useMemo(() => validateEquations(equations), [equations]);

  const onChange = (index: number, field: 'a' | 'm', value: string) => {
    setEquations((prev) =>
      prev.map((eq, i) => (i === index ? { ...eq, [field]: value } : eq)),
    );
    setSolution(null);
    setError('');
  };

  const onAdd = () => {
    setEquations((prev) =>
      prev.length >= 10 ? prev : [...prev, { a: '', m: '' }],
    );
    setSolution(null);
    setError('');
  };

  const onRemove = () => {
    setEquations((prev) => (prev.length <= 1 ? prev : prev.slice(0, -1)));
    setSolution(null);
    setError('');
  };

  const onResetExample = () => {
    const EXAMPLE_PRIMES = [
      // first 10 primes
      2, 3, 5, 7, 11, 13, 17, 19, 23, 29,
      // deterministic fallback (only used if needed)
      31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107,
      109, 113,
    ];
    // Classic example: x ≡ 2 (mod 3), x ≡ 3 (mod 5), x ≡ 2 (mod 7) -> x ≡ 23 (mod 105)
    setEquations((prev) => {
      // Track moduli already present (so we don't reuse them)
      const used = new Set<string>();
      for (const eq of prev) {
        const mStr = eq.m.trim();
        if (mStr !== '' && /^\d+$/.test(mStr)) used.add(mStr);
      }

      let primeIdx = 0;
      const nextUnusedModulus = (): string => {
        while (primeIdx < EXAMPLE_PRIMES.length) {
          const cand = String(EXAMPLE_PRIMES[primeIdx++]);
          if (!used.has(cand)) {
            used.add(cand);
            return cand;
          }
        }
        // Extremely unlikely with max=10, but keep deterministic:
        // just keep stepping through odd numbers from the last prime.
        let x = EXAMPLE_PRIMES[EXAMPLE_PRIMES.length - 1] + 2;
        while (true) {
          const cand = String(x);
          if (!used.has(cand)) {
            used.add(cand);
            return cand;
          }
          x += 2;
        }
      };

      return prev.map((eq, i) => {
        const aStr = eq.a.trim();
        const mStr = eq.m.trim();

        // If both are empty, fully populate
        if (aStr === '' && mStr === '') {
          const mNew = nextUnusedModulus();
          const mNum = Number(mNew);
          // pick a in [1, m-1] (never 0), deterministic
          const aNew = String(mNum <= 2 ? 1 : ((i + 2) % (mNum - 1)) + 1);
          return { a: aNew, m: mNew };
        }

        // If partially filled, fill the missing piece(s)
        const mFinal = mStr === '' ? nextUnusedModulus() : mStr;
        const aFinal = aStr === '' ? String(i + 1) : aStr;

        return { a: aFinal, m: mFinal };
      });
    });

    setSolution(null);
    setError('');
  };

  const onClear = () => {
    setEquations([
      { a: '', m: '' },
      { a: '', m: '' },
      { a: '', m: '' },
    ]);
    setSolution(null);
    setError('');
  };

  const compute = async () => {
    setError(null);
    setSolution(null);
    setWorking(true);

    try {
      await new Promise((r) => setTimeout(r, 0));

      const compact = equations.filter(
        (eq) => !(eq.a.trim() === '' && eq.m.trim() === ''),
      );
      if (compact.length > 0 && compact.length !== equations.length) {
        setEquations(compact);
      }

      if (compact.length === 0) {
        throw new MathValidationError('a_{1}', 'cannot be empty.');
      }

      // 1. Pool empty inputs across ALL active rows
      const missingA: string[] = [];
      const missingM: string[] = [];

      compact.forEach((eq, i) => {
        if (eq.a.trim() === '') missingA.push(`a_{${i + 1}}`);
        if (eq.m.trim() === '') missingM.push(`m_{${i + 1}}`);
      });

      if (missingA.length > 0 && missingM.length > 0) {
        throw new MathValidationError(
          [...missingA, ...missingM],
          'cannot be empty.',
        );
      } else if (missingA.length > 0) {
        throw new MathValidationError(missingA, 'cannot be empty.');
      } else if (missingM.length > 0) {
        throw new MathValidationError(missingM, 'cannot be empty.');
      }

      // 2. Parse (since we guaranteed nothing is empty, parseBigIntStrict is safe)
      const parsed: CRTEquationParsed[] = compact.map((eq, i) => {
        const a = parseBigIntStrict(eq.a, `a_{${i + 1}}`);
        const m = parseBigIntStrict(eq.m, `m_{${i + 1}}`);
        return { a, m };
      });

      const crtResult = solveCRT(parsed);
      setSolution(crtResult);
    } catch (e) {
      if (e instanceof MathValidationError) {
        setError(<MathErrorView error={e} />);
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Failed to compute CRT solution.');
      }
    } finally {
      setWorking(false);
    }
  };

  return (
    <div>
      <CRTInputPanel
        equations={equations}
        onChange={onChange}
        onAdd={onAdd}
        onRemove={onRemove}
        onResetExample={onResetExample}
        onClear={onClear}
        liveErrors={validation.liveErrors}
        isCoprime={validation.isCoprime}
        onEnter={() => {
          if (validation.canSolve && !working) compute();
        }}
      />

      <div className="mt-4 flex flex-wrap items-center gap-3 pb-1">
        <button
          type="button"
          onClick={compute}
          disabled={!validation.canSolve || working}
          className={primaryButtonClass}
          title="Compute CRT solution"
        >
          {working ? 'Computing…' : 'Solve'}
        </button>

        <button
          type="button"
          onClick={onClear}
          className={secondaryButtonClass}
        >
          Clear
        </button>
      </div>

      {error ? <div className={errorBoxClass}>{error}</div> : null}

      {solution ? (
        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-lg bg-gray-900/40 border border-gray-700">
            <div className="text-sm text-gray-300">System:</div>
            <div className="mt-2 space-y-1">
              {equations.map((eq, i) => (
                <div key={i} className="text-sm text-gray-200">
                  <MathText>
                    {String.raw`x \equiv ${eq.a.trim()} \pmod{${eq.m.trim()}}`}
                  </MathText>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gray-900/40 border border-gray-700">
            <MathText block className="block text-sm text-gray-200">
              {String.raw`x \equiv ${solution.x.toString()} \pmod{${solution.M.toString()}}`}
            </MathText>
          </div>

          <NumericOutput
            label={
              <MathText>
                {String.raw`x \equiv ${solution.x.toString()} \pmod{${solution.M.toString()}}`}
              </MathText>
            }
            value={solution.x.toString()}
          />

          <NumericOutput
            label={<MathText>{String.raw`M`}</MathText>}
            value={solution.M.toString()}
          />

          <div className="text-sm text-gray-300">
            Any solution is{' '}
            <MathText className="text-purple-200">{String.raw`x + M \cdot k`}</MathText>{' '}
            for integer{' '}
            <MathText className="text-purple-200">{String.raw`k`}</MathText>.
          </div>
        </div>
      ) : null}

      <p className="mt-2 text-xs text-gray-300">
        Learn more:{' '}
        <a
          href={CRT_LEARN_MORE}
          target="_blank"
          rel="noreferrer"
          className="text-purple-300 hover:text-purple-200 underline underline-offset-2"
        >
          detailed steps
        </a>
      </p>
    </div>
  );
};

export default CRTSolver;
