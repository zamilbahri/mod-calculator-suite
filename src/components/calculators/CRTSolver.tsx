import React, { useMemo, useState } from 'react';
import MathText from '../shared/MathText';
import NumericOutput from '../shared/NumericOutput';
import {
  errorBoxClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../shared/ui';
import {
  arePairwiseCoprime,
  parseBigIntStrict,
  solveCRT,
} from '../../utils/numberTheory';
import type {
  CRTSolution,
  CRTEquationParsed,
  CRTEquationDraft,
} from '../../types/index.ts';
import CRTInputPanel from './CRTInputPanel';

const CRT_LEARN_MORE = 'https://zamilbahri.github.io/crt-solver';

function validateEquations(eqs: CRTEquationDraft[]): {
  errors: React.ReactNode[];
  isCoprime: boolean | null;
  parsed: CRTEquationParsed[] | null;
} {
  const errors: React.ReactNode[] = [];

  // Only consider "active" rows (not both empty)
  const active = eqs.filter(
    (eq) => !(eq.a.trim() === '' && eq.m.trim() === ''),
  );

  // No active equations -> not ready to check coprimality
  if (active.length === 0) {
    return { errors: [], isCoprime: null, parsed: null };
  }

  const parsed: CRTEquationParsed[] = [];
  let ready = true;

  for (let i = 0; i < active.length; i++) {
    const aStr = active[i].a.trim();
    const mStr = active[i].m.trim();

    // If partially filled, we can't assess coprime yet
    if (aStr === '' || mStr === '') {
      ready = false;
      continue;
    }

    // Digits-only checks (usually redundant if NumericInput filters, but safe)
    if (!/^\d+$/.test(aStr) || !/^\d+$/.test(mStr)) {
      ready = false;
      continue;
    }

    const a = BigInt(aStr);
    const m = BigInt(mStr);

    if (m < 2n) {
      errors.push(
        <span>
          <MathText>{`m_${i + 1}`}</MathText>
          {` must be at least `}
          <MathText>2</MathText>.
        </span>,
      );
      continue;
    }

    parsed.push({ a, m });
  }

  if (!ready || errors.length > 0 || parsed.length !== active.length) {
    return { errors, isCoprime: null, parsed: null };
  }

  const moduli = parsed.map((p) => p.m);
  return { errors, isCoprime: arePairwiseCoprime(moduli), parsed };
}

const CRTSolver: React.FC = () => {
  const [equations, setEquations] = useState<CRTEquationDraft[]>([
    { a: '', m: '' },
    { a: '', m: '' },
    { a: '', m: '' },
  ]);

  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string>('');
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
      // first 10 primes (as requested)
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
    setError('');
    setSolution(null);
    setWorking(true);

    try {
      await new Promise((r) => setTimeout(r, 0));

      // Remove rows where BOTH a and m are empty
      const compact = equations.filter(
        (eq) => !(eq.a.trim() === '' && eq.m.trim() === ''),
      );

      // If we removed any, reflect it in the UI (per your requirement)
      if (compact.length > 0 && compact.length !== equations.length) {
        setEquations(compact);
      }

      // If everything was empty, force parseBigIntStrict to throw your standard message
      if (compact.length === 0) {
        parseBigIntStrict('', 'a_1'); // throws: "a_1 must be a non-negative integer."
      }

      // Parse only the compacted equations.
      // If any active row is missing a or m, parseBigIntStrict will throw the desired message.
      const parsed: CRTEquationParsed[] = compact.map((eq, i) => {
        const a = parseBigIntStrict(eq.a, `a_${i + 1}`);
        const m = parseBigIntStrict(eq.m, `m_${i + 1}`);
        if (m < 2n) throw new Error(`m_${i + 1} must be at least 2.`);
        return { a, m };
      });

      const crtResult = solveCRT(parsed);
      setSolution(crtResult);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Failed to compute CRT solution.',
      );
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="space-y-6">
      <CRTInputPanel
        equations={equations}
        onChange={onChange}
        onAdd={onAdd}
        onRemove={onRemove}
        onResetExample={onResetExample}
        onClear={onClear}
        errors={validation.errors}
        isCoprime={validation.isCoprime}
        onEnter={() => {
          if (!working) compute();
        }}
      />

      <div className="flex flex-wrap items-center gap-3 pb-1">
        <button
          type="button"
          onClick={compute}
          disabled={working}
          className={primaryButtonClass}
          title="Compute CRT solution (empty rows are ignored)"
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
