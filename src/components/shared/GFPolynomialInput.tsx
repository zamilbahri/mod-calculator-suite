import React from 'react';
import { inputClass, labelClass } from './ui';
import CopyButton from './CopyButton';

interface GFPolynomialInputProps {
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  placeholder?: string;
}

const GFPolynomialInput: React.FC<GFPolynomialInputProps> = ({
  label,
  value,
  onChange,
  onEnter,
  placeholder = 'e.g. 1 0 1 1 for x^3 + x + 1',
}) => {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className={labelClass}>{label}</label>
        <CopyButton value={value} tabIndex={-1} />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          // Allow only 0, 1, spaces
          if (/^[01\s]*$/.test(v)) {
            onChange(v);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onEnter?.();
          }
        }}
        placeholder={placeholder}
        className={inputClass}
        spellCheck={false}
      />
      <div className="mt-1 text-xs text-gray-500">
        Highest degree coefficient first, space-separated.
      </div>
    </div>
  );
};

export default GFPolynomialInput;
