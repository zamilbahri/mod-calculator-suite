import { useLayoutEffect, useMemo, useRef } from 'react';
import { labelClass } from './ui';
import CopyButton from './CopyButton';
import { isNonNegativeIntegerString } from '../../utils/numberTheory';

const textAreaClass = [
  'w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white',
  'outline-none focus:ring-2 focus:ring-purple-500/60 resize-none',
  'overflow-y-auto placeholder:text-gray-500 ',
].join(' ');

interface NumericInputProps {
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  placeholder?: string;
  maxDigits?: number;
  minRows?: number;
  rows?: number;
}

const NumericInput: React.FC<NumericInputProps> = ({
  label,
  value,
  placeholder = 'Enter a non-negative integer',
  maxDigits: maxLength = 1250,
  minRows,
  rows = 4,
  onChange,
  onEnter,
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const minRowsResolved = useMemo(() => {
    const min = minRows ?? rows;
    return Math.max(1, Math.min(min, rows));
  }, [minRows, rows]);

  // AI slop for auto-resizing textarea based on content, with min and max height constraints
  // I dont know how this works but it seems to work well so I'm not going to question it
  useLayoutEffect(() => {
    const el = textAreaRef.current;
    if (!el) return;

    const styles = window.getComputedStyle(el);
    const lineHeight = parseFloat(styles.lineHeight) || 20;
    const verticalPadding =
      parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
    const verticalBorder =
      parseFloat(styles.borderTopWidth) + parseFloat(styles.borderBottomWidth);

    const minHeight =
      lineHeight * minRowsResolved + verticalPadding + verticalBorder;
    const maxHeight = lineHeight * rows + verticalPadding + verticalBorder;

    el.style.height = 'auto';
    const nextHeight = Math.min(
      Math.max(el.scrollHeight, minHeight),
      maxHeight,
    );
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [value, rows, minRowsResolved]);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <label className={labelClass}>{label}</label>
          {value && (
            <span className="text-xs text-gray-500">
              {value.length}/{maxLength} digits
            </span>
          )}
        </div>
        <CopyButton value={value} tabIndex={-1} />
      </div>
      <textarea
        ref={textAreaRef}
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          if (isNonNegativeIntegerString(v)) onChange(v);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onEnter?.();
          }
        }}
        placeholder={placeholder}
        className={textAreaClass}
        inputMode="numeric"
        spellCheck={false}
        rows={minRowsResolved}
        maxLength={maxLength}
      />
    </div>
  );
};

export default NumericInput;
