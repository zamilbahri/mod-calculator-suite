import React, { useMemo, useState } from 'react';
import MathText from '../shared/MathText';
import CopyableCodeBlock from '../shared/CopyableCodeBlock';
import {
  errorBoxClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../shared/ui';
import { extendedGCD, parseBigIntStrict } from '../../utils/numberTheory';
import NumericInput from '../shared/NumericInput';

function modNormalize(x: bigint, m: bigint): bigint {
  // assumes m > 0
  const r = x % m;
  return r >= 0n ? r : r + m;
}

const GCDCalculator: React.FC = () => {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [g, setG] = useState<bigint | null>(null);
  const [x, setX] = useState<bigint | null>(null);
  const [y, setY] = useState<bigint | null>(null);
  const [error, setError] = useState<string>('');
  const [working, setWorking] = useState(false);
  const [computed, setComputed] = useState(false);

  const inv = useMemo(() => {
    if (!computed || g === null || x === null) return null;

    // interpret b as modulus for inverse output
    const B = (() => {
      try {
        return parseBigIntStrict(b, 'b');
      } catch {
        return null;
      }
    })();
    if (B === null) return null;

    if (B < 2n) return null;
    if (g !== 1n) return null;

    return modNormalize(x, B);
  }, [computed, g, x, b]);

  const compute = async () => {
    setError('');
    setComputed(false);
    setWorking(true);
    try {
      await new Promise((r) => setTimeout(r, 0));
      const A = parseBigIntStrict(a, 'a');
      const B = parseBigIntStrict(b, 'b');
      const res = extendedGCD(A, B);
      setG(res.gcd);
      setX(res.x);
      setY(res.y);
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
    setComputed(false);
    setG(null);
    setX(null);
    setY(null);
    setError('');
  };

  const hasResult = computed && g !== null && x !== null && y !== null;

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-4">
        <NumericInput
          label={<MathText>a</MathText>}
          value={a}
          onChange={(val) => {
            setA(val);
            setComputed(false);
          }}
        />
        <NumericInput
          label={<MathText>b</MathText>}
          value={b}
          onChange={(val) => {
            setB(val);
            setComputed(false);
          }}
        />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={compute}
          disabled={working}
          className={primaryButtonClass}
        >
          {working ? 'Computing…' : 'Compute GCD'}
        </button>
        <button type="button" onClick={clear} className={secondaryButtonClass}>
          Clear
        </button>
      </div>
      {error ? <div className={errorBoxClass}>{error}</div> : null}
      {hasResult ? (
        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-lg bg-gray-900/40 border border-gray-700">
            <div className="text-sm text-gray-300">
              <MathText
                block
              >{`\\gcd(${a.trim()}, ${b.trim()}) = ${g}`}</MathText>
            </div>
            <div className="mt-3 text-sm text-gray-300">
              <MathText block>
                {`${a}\\cdot(${x}) + ${b}\\cdot(${y}) = ${g}`}
              </MathText>
            </div>
          </div>
          <CopyableCodeBlock
            label={<MathText>{`\\gcd(a,b)`}</MathText>}
            value={g.toString()}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <CopyableCodeBlock
              label={
                <span>
                  <MathText>x</MathText> (coefficient for <MathText>a</MathText>
                  )
                </span>
              }
              value={x}
            />
            <CopyableCodeBlock
              label={
                <span>
                  <MathText>y</MathText> (coefficient for <MathText>b</MathText>
                  )
                </span>
              }
              value={y}
            />
          </div>
          <div className="p-4 rounded-lg bg-gray-900/40 border border-gray-700">
            <div className="text-sm text-purple-200 font-semibold">
              Modular inverse (treating b as modulus)
            </div>
            {(() => {
              const B = BigInt(b.trim() || '0');
              if (B < 2n) {
                return (
                  <div className="mt-2 text-sm text-gray-300">
                    Modulus must be at least 2 to define a modular inverse.
                  </div>
                );
              }
              if (g !== 1n) {
                return (
                  <div className="mt-2 text-sm text-gray-300">
                    No inverse:{' '}
                    <MathText className="text-purple-200">
                      {'\\gcd(a,b) \\neq 1'}
                    </MathText>
                    .
                  </div>
                );
              }
              return (
                <div className="mt-2 space-y-3">
                  <MathText block className="block text-sm text-gray-200">
                    {`${a.trim()}^{-1} \\equiv ${inv!.toString()} \\pmod{${b.trim()}}`}
                  </MathText>
                  <CopyableCodeBlock
                    label={<MathText>{`a^{-1} \\bmod b`}</MathText>}
                    value={inv!.toString()}
                  />
                </div>
              );
            })()}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default GCDCalculator;
