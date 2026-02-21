import React, { useState } from 'react';
import MathText from '../shared/MathText';
import NumericInput from '../shared/NumericInput';
import {
  errorBoxClass,
  primaryButtonClass,
  secondaryButtonClass,
  tertiaryButtonClass,
} from '../shared/ui';
import {
  isNonNegativeIntegerString,
  MathValidationError,
} from '../../utils/numberTheory';

import Chevron from '../shared/Chevron';
import type { CRTEquationDraft } from '../../types';

export interface CRTInputPanelProps {
  equations: CRTEquationDraft[];
  onChange: (index: number, field: 'a' | 'm', value: string) => void;
  onAdd: () => void;
  onRemove: () => void;
  onResetExample: () => void;
  onClear: () => void;
  onEnter?: () => void;
  errors: MathValidationError[];
  isCoprime: boolean | null; // null if inputs not ready to check
}

const MAX_EQUATIONS = 10;
const MIN_EQUATIONS = 1;

function acceptDigitsOnly(next: string): string | null {
  const v = next.trim();
  return isNonNegativeIntegerString(v) ? v : null;
}

const CRTInputPanel: React.FC<CRTInputPanelProps> = ({
  equations,
  onChange,
  onAdd,
  onRemove,
  onResetExample,
  onClear,
  onEnter,
  errors,
  isCoprime,
}) => {
  const canAdd = equations.length < MAX_EQUATIONS;
  const canRemove = equations.length > MIN_EQUATIONS;
  const [isEquationCollapsed, setEquationCollapsed] = useState(false);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* placeholder to keep buttons right-aligned when title wraps */}
        <div></div>
        {''}

        <div className="flex flex-wrap items-center gap-3">
          {!canAdd && (
            <span className="italic text-sm text-gray-300 self-center mr-1">
              Equation limit reached
            </span>
          )}

          <button
            type="button"
            onClick={() => canAdd && onAdd()}
            disabled={!canAdd}
            className={primaryButtonClass}
            title={
              canAdd
                ? 'Add equation'
                : `Maximum ${MAX_EQUATIONS} equations reached`
            }
          >
            + Add equation
          </button>

          <button
            type="button"
            onClick={onRemove}
            disabled={!canRemove}
            className={secondaryButtonClass}
            title={
              canRemove
                ? 'Remove last equation'
                : `Minimum ${MIN_EQUATIONS} equations required`
            }
          >
            − Remove
          </button>

          <button
            type="button"
            onClick={onResetExample}
            className={secondaryButtonClass}
          >
            Load example
          </button>

          <button
            type="button"
            onClick={onClear}
            className={secondaryButtonClass}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {isCoprime === true && (
          <div className="inline-flex items-center gap-2 rounded-lg border border-purple-600 bg-gray-800 px-3 py-2 text-sm text-purple-200">
            <span className="font-semibold">✓</span> Moduli are pairwise coprime
          </div>
        )}
        {isCoprime === false && (
          <div className="inline-flex items-center gap-2 rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-200">
            <span className="font-semibold">!</span> Moduli are not pairwise
            coprime
          </div>
        )}
        {isCoprime === null && (
          <div className="text-sm text-gray-300">
            Enter all <MathText className="text-purple-200">{'a_i'}</MathText>{' '}
            and <MathText className="text-purple-200">{'m_i'}</MathText> to
            check coprimality.
          </div>
        )}

        <button
          type="button"
          onClick={() => setEquationCollapsed((c) => !c)}
          className={`${tertiaryButtonClass} flex items-center gap-x-1`}
        >
          <Chevron open={!isEquationCollapsed} />
          {isEquationCollapsed ? 'Show equations' : 'Hide equations'}
        </button>
      </div>

      {!isEquationCollapsed && (
        <>
          <div className="space-y-4">
            {equations.map((eq, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NumericInput
                  label={
                    <span className="flex flex-wrap gap-x-2 items-baseline">
                      <MathText className="text-purple-200">{String.raw`a_{${i + 1}}`}</MathText>
                      <span className="text-gray-300 text-sm">(remainder)</span>
                    </span>
                  }
                  value={eq.a}
                  placeholder="e.g. 2"
                  onChange={(next) => {
                    const v = acceptDigitsOnly(next);
                    if (v !== null) onChange(i, 'a', v);
                  }}
                  maxLength={600}
                  onEnter={onEnter}
                />

                <NumericInput
                  label={
                    <span className="flex flex-wrap gap-x-2 items-baseline">
                      <MathText className="text-purple-200">{String.raw`m_{${i + 1}}`}</MathText>
                      <span className="text-gray-300 text-sm">(modulus)</span>
                    </span>
                  }
                  value={eq.m}
                  placeholder="e.g. 7"
                  onChange={(next) => {
                    const v = acceptDigitsOnly(next);
                    if (v !== null) onChange(i, 'm', v);
                  }}
                  maxLength={600}
                  onEnter={onEnter}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {equations.length >= MAX_EQUATIONS ? (
        <div className="mt-3 italic text-sm text-gray-300">
          Equation limit reached
        </div>
      ) : null}

      {errors.length > 0 ? (
        <div className={errorBoxClass}>
          {errors.map((e, i) => (
            //TODO: display as MathText
            <div key={i}>{e.message}</div>
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default CRTInputPanel;
