import React, { useState } from 'react';
import MathText from '../shared/MathText';
import NumericOutput from '../shared/NumericOutput';
import {
  errorBoxClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../shared/ui';
import {
  parseBigIntStrict,
  solveLinearCongruence,
  type LinearCongruenceResult,
} from '../../utils/numberTheory';
import NumericInput from '../shared/NumericInput';

const LinearCongruenceCalculator: React.FC = () => {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [n, setN] = useState('');

  const [error, setError] = useState<string>('');
  const [working, setWorking] = useState(false);
  const [computed, setComputed] = useState(false);
  const [result, setResult] = useState<LinearCongruenceResult | null>(null);

  const compute = async () => {
    setError('');
    setComputed(false);
    setResult(null);
    setWorking(true);

    try {
      await new Promise((r) => setTimeout(r, 0));
      const A = parseBigIntStrict(a, 'a');
      const B = parseBigIntStrict(b, 'b');
      const N = parseBigIntStrict(n, 'n');

      const res = solveLinearCongruence(A, B, N);
      setResult(res);

      setComputed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid input.');
    } finally {
      setWorking(false);
    }
  };

  const clear = () => {
    setA('');
    setB('');
    setN('');
    setComputed(false);
    setResult(null);
    setError('');
  };

  return (
    <div>
      <div className="grid sm:grid-cols-3 gap-4">
        <NumericInput
          label={<MathText>a</MathText>}
          value={a}
          onChange={(val) => {
            setA(val);
            setComputed(false);
          }}
          onEnter={compute}
        />
        <NumericInput
          label={<MathText>b</MathText>}
          value={b}
          onChange={(val) => {
            setB(val);
            setComputed(false);
          }}
          onEnter={compute}
        />
        <NumericInput
          label={<MathText>n</MathText>}
          value={n}
          onChange={(val) => {
            setN(val);
            setComputed(false);
          }}
          onEnter={compute}
        />
      </div>
      <div className="mt-4 flex items-center gap-3 pb-1">
        <button
          type="button"
          onClick={compute}
          disabled={working}
          className={primaryButtonClass}
        >
          {working ? 'Computing…' : 'Compute'}
        </button>
        <button type="button" onClick={clear} className={secondaryButtonClass}>
          Clear
        </button>
      </div>
      {error ? <div className={errorBoxClass}>{error}</div> : null}
      {computed && result ? (
        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-lg bg-gray-900/40 border border-gray-700">
            <div className="text-sm text-gray-300">
              <MathText block>{`\\gcd(${a.trim()}, ${n.trim()}) = ${result.d}`}</MathText>
            </div>
            {result.solutions.length === 0 ? (
              <div className="mt-3 text-sm text-red-300 font-medium">
                No solutions exist because {result.d.toString()} does not divide{' '}
                {b.trim()}.
              </div>
            ) : (
              <div className="mt-3 text-sm text-gray-300">
                Since {result.d.toString()} divides {b.trim()}, there are{' '}
                {result.d.toString()} distinct solutions modulo {n.trim()}:
              </div>
            )}
          </div>

          {result.solutions.length > 0 && (
            <>
              <NumericOutput
                label={<MathText>{`x \\pmod{${result.mod}}`}</MathText>}
                value={result.baseSolution.toString()}
              />
              <div className="p-4 rounded-lg bg-gray-900/40 border border-gray-700">
                <div className="text-sm text-purple-200 font-semibold mb-3">
                  Distinct Solutions modulo {n.trim()}
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.solutions.map((sol, idx) => (
                    <div
                      key={idx}
                      className="px-2 py-1 bg-gray-800 border border-gray-700 rounded-md text-sm font-mono text-gray-200"
                    >
                      {sol.toString()}
                    </div>
                  ))}
                  {result.d > 20n && (
                    <div className="px-2 py-1 text-sm text-gray-400 self-center">
                      ...and {(result.d - 20n).toString()} more
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default LinearCongruenceCalculator;