import React, { useMemo, useState } from 'react';
import { labelClass } from './ui';

interface NumericInputProps {
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

const NumericInput: React.FC<NumericInputProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Enter a non-negative integer',
  maxLength = 2000,
}) => {
  const [copied, setCopied] = useState(false);
  const canCopy = useMemo(
    () => typeof navigator !== 'undefined' && !!navigator.clipboard,
    [],
  );

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 900);
    } catch {
      // silently fail
    }
  };

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
        <button
          type="button"
          onClick={onCopy}
          disabled={!canCopy || !value}
          className="text-xs px-3 py-1 rounded-md bg-gray-700 border border-gray-600 hover:bg-gray-600 disabled:opacity-50"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          if (v === '' || /^\d+$/.test(v)) onChange(v);
        }}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-purple-500/60 resize-none overflow-y-auto"
        inputMode="numeric"
        spellCheck={false}
        rows={4}
        maxLength={maxLength}
      />
    </div>
  );
};

export default NumericInput;
