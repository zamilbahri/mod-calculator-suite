import React, { useMemo, useState } from 'react';

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

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 900);
    } catch {
      // If clipboard fails, we silently do nothing (browser permissions, etc.)
    }
  };

  return (
    <div className={className}>
      {label ? (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-purple-300">{label}</span>
          <button
            type="button"
            onClick={onCopy}
            disabled={!canCopy}
            className="text-xs px-3 py-1 rounded-md bg-gray-700 border border-gray-600 hover:bg-gray-650 disabled:opacity-50"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      ) : (
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={onCopy}
            disabled={!canCopy}
            className="text-xs px-3 py-1 rounded-md bg-gray-700 border border-gray-600 hover:bg-gray-650 disabled:opacity-50"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}

      <pre className="bg-gray-900/60 border border-gray-700 rounded-lg p-4 overflow-auto">
        <code className="text-white whitespace-pre-wrap wrap-break-word">
          {value}
        </code>
      </pre>
    </div>
  );
};

export default CopyableCodeBlock;
