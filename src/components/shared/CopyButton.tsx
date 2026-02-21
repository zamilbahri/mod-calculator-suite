import React, { useMemo, useState } from 'react';
import { tertiaryButtonClass } from './ui';

interface CopyButtonProps {
  value: string;
  tabIndex?: number;
}

const CopyButton: React.FC<CopyButtonProps> = ({ value, tabIndex }) => {
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
    <button
      type="button"
      onClick={onCopy}
      disabled={!canCopy || !value}
      tabIndex={tabIndex}
      className={tertiaryButtonClass}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

export default CopyButton;
