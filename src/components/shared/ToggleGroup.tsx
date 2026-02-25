import type React from 'react';

export type ToggleGroupOption<Value extends string> = {
  value: Value;
  label: React.ReactNode;
  title?: string;
  disabled?: boolean;
};

type ToggleGroupProps<Value extends string> = {
  value: Value;
  options: readonly ToggleGroupOption<Value>[];
  onChange: (value: Value) => void;
  minimal?: boolean;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
};

const baseGroupClass =
  'inline-flex overflow-hidden border border-gray-600 bg-gray-800/80';
const regularGroupClass = `${baseGroupClass} rounded-lg`;
const minimalGroupClass = `${baseGroupClass} rounded-md`;

const baseButtonClass =
  'outline-none transition-colors focus-visible:ring-2 focus-visible:ring-purple-500/70 focus-visible:ring-inset disabled:opacity-50';
const regularButtonClass = `${baseButtonClass} px-4 py-2`;
const minimalButtonClass = `${baseButtonClass} px-3 py-1 text-xs`;

const regularInactiveClass = 'bg-gray-800 text-gray-200 hover:bg-gray-700';
const regularActiveClass = 'bg-purple-600 text-white';
const minimalInactiveClass = 'bg-gray-700 text-gray-200 hover:bg-gray-600';
const minimalActiveClass = 'bg-gray-600 text-white';

const ToggleGroup = <Value extends string>({
  value,
  options,
  onChange,
  minimal = false,
  disabled = false,
  className = '',
  ariaLabel,
}: ToggleGroupProps<Value>) => {
  if (options.length < 2) {
    throw new Error('ToggleGroup requires at least two options.');
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`${minimal ? minimalGroupClass : regularGroupClass} ${className}`.trim()}
    >
      {options.map((option, index) => {
        const active = option.value === value;
        const optionDisabled = disabled || option.disabled === true;
        const buttonClass = minimal ? minimalButtonClass : regularButtonClass;
        const activeClass = minimal ? minimalActiveClass : regularActiveClass;
        const inactiveClass = minimal
          ? minimalInactiveClass
          : regularInactiveClass;

        return (
          <button
            key={option.value}
            type="button"
            title={option.title}
            aria-pressed={active}
            disabled={optionDisabled}
            onClick={() => {
              if (optionDisabled || active) return;
              onChange(option.value);
            }}
            className={`${buttonClass} ${
              index === 0 ? '' : 'border-l border-gray-600'
            } ${active ? activeClass : inactiveClass}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default ToggleGroup;
