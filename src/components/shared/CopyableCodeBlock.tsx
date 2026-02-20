import React, { useMemo, useState } from 'react';

const copyButtonClass = [
  'text-xs px-3 py-1 rounded-md bg-gray-700 border',
  'border-gray-600 hover:bg-gray-600 disabled:opacity-50',
].join(' ');

export interface CopyableCodeBlockProps {
  value: string;
  label?: React.ReactNode;
  className?: string;
}

const CopyableCodeBlock: React.FC<CopyableCodeBlockProps> = ({
  value,
  label,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const canCopy = useMemo(
    () => typeof navigator !== 'undefined' && !!navigator.clipboard,
    [],
  );

  const digitCount = value.replace(/\D/g, '').length;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 900);
    } catch {
      // If clipboard fails, we silently do nothing (browser permissions, etc.)
    }
  };

  const labelRow = (
    <div className="mb-2 flex items-center justify-between">
      <div className="flex items-baseline gap-2">
        <span className="text-sm text-purple-300">{label}</span>
        {digitCount > 0 && (
          <span className="text-xs text-gray-500">({digitCount} digits)</span>
        )}
      </div>
      <button
        type="button"
        onClick={onCopy}
        disabled={!canCopy}
        className={copyButtonClass}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );

  return (
    <div className={className}>
      {labelRow}
      <pre className="bg-gray-900/60 border border-gray-700 rounded-lg p-4 overflow-auto">
        <code className="text-white whitespace-pre-wrap wrap-break-word">
          {value}
        </code>
      </pre>
    </div>
  );
};

export default CopyableCodeBlock;
