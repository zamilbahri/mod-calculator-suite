import React, { useMemo, useState } from 'react';
import { labelClass } from './ui';

interface NumericInputProps {
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const NumericInput: React.FC<NumericInputProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Enter an integer',
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
        <label className={labelClass}>{label}</label>
        <button
          type="button"
          onClick={onCopy}
          disabled={!canCopy || !value}
          className="text-xs px-3 py-1 rounded-md bg-gray-700 border border-gray-600 hover:bg-gray-650 disabled:opacity-50"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-purple-500/60 resize-none overflow-y-auto"
        inputMode="numeric"
        spellCheck={false}
        rows={4}
      />
    </div>
  );
};

export default NumericInput;
