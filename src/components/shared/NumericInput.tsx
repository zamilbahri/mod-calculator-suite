import { labelClass } from './ui';
import CopyButton from './CopyButton';

const textAreaClass = [
  'w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white',
  'outline-none focus:ring-2 focus:ring-purple-500/60 resize-none',
  'overflow-y-auto placeholder:text-gray-500',
].join(' ');

interface NumericInputProps {
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  placeholder?: string;
  maxLength?: number;
}

const NumericInput: React.FC<NumericInputProps> = ({
  label,
  value,
  onChange,
  onEnter,
  placeholder = 'Enter a non-negative integer',
  maxLength = 2000,
}) => {
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
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          if (v === '' || /^\d+$/.test(v)) onChange(v);
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
        rows={4}
        maxLength={maxLength}
      />
    </div>
  );
};

export default NumericInput;
