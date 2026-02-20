import React, { useMemo, useState } from 'react';
import MathText from '../shared/MathText';
import CopyableCodeBlock from '../shared/CopyableCodeBlock';
import {
  errorBoxClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../shared/ui';
import {
  extendedGCD,
  parseBigIntStrict,
  modNormalize,
} from '../../utils/numberTheory';
import NumericInput from '../shared/NumericInput';

const GCDCalculator: React.FC = () => {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [g, setG] = useState<bigint | null>(null);
  const [x, setX] = useState<bigint | null>(null);
  const [y, setY] = useState<bigint | null>(null);
  const [error, setError] = useState<string>('');
  const [working, setWorking] = useState(false);
  const [computed, setComputed] = useState(false);
  const [swapInv, setSwapInv] = useState(false);

  const invInfo = useMemo(() => {
    if (!computed || g === null || x === null || y === null) return null;

    let A: bigint;
    let B: bigint;
    try {
      A = parseBigIntStrict(a, 'a');
      B = parseBigIntStrict(b, 'b');
    } catch {
      return null;
    }

    const baseStr = swapInv ? b.trim() : a.trim(); // whose inverse?
    const modStr = swapInv ? a.trim() : b.trim(); // modulus?

    const mod = swapInv ? A : B;
    const coeff = swapInv ? y : x; // y gives b^{-1} mod a, x gives a^{-1} mod b

    if (mod < 2n) {
      return {
        ok: false as const,
        reason: 'Modulus must be at least 2 to define a modular inverse.',
        baseStr,
        modStr,
      };
    }

    if (g !== 1n) {
      return {
        ok: false as const,
        reason: 'No inverse: gcd(a,b) ≠ 1.',
        baseStr,
        modStr,
      };
    }

    const invVal = modNormalize(coeff, mod);

    return {
      ok: true as const,
      inv: invVal,
      baseStr,
      modStr,
    };
  }, [computed, g, x, y, a, b, swapInv]);

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
          {working ? 'Computing…' : 'Compute'}
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
              value={x.toString()}
            />
            <CopyableCodeBlock
              label={
                <span>
                  <MathText>y</MathText> (coefficient for <MathText>b</MathText>
                  )
                </span>
              }
              value={y.toString()}
            />
          </div>
          <div className="p-4 rounded-lg bg-gray-900/40 border border-gray-700">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-purple-200 font-semibold">
                Modular inverse
              </div>

              <button
                type="button"
                onClick={() => setSwapInv((v) => !v)}
                className="text-xs px-3 py-1 rounded-md bg-gray-700 border border-gray-600 hover:bg-gray-600"
                title="Swap which value is inverted and which is the modulus"
              >
                {swapInv ? (
                  <span>
                    Show <MathText>{`a^{-1} \\bmod b`}</MathText> instead
                  </span>
                ) : (
                  <span>
                    Show <MathText>{`b^{-1} \\bmod a`}</MathText> instead
                  </span>
                )}
              </button>
            </div>

            {!invInfo ? null : invInfo.ok ? (
              <div className="mt-3 space-y-3">
                <MathText block className="block text-sm text-gray-200">
                  {`${invInfo.baseStr}^{-1} \\equiv ${invInfo.inv.toString()} \\pmod{${invInfo.modStr}}`}
                </MathText>

                <CopyableCodeBlock
                  // label={swapInv ? 'b^{-1} mod a' : 'a^{-1} mod b'}
                  label={
                    swapInv ? (
                      <MathText>{`b^{-1} \\bmod a`}</MathText>
                    ) : (
                      <MathText>{`a^{-1} \\bmod b`}</MathText>
                    )
                  }
                  value={invInfo.inv.toString()}
                />
              </div>
            ) : (
              <div className="mt-3 text-sm text-gray-300">{invInfo.reason}</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default GCDCalculator;
