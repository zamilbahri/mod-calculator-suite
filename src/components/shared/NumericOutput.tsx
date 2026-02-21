import { labelClass } from './ui';
import CopyButton from './CopyButton';

export interface NumericOutputProps {
  value: string;
  label?: React.ReactNode;
  className?: string;
}

const NumericOutput: React.FC<NumericOutputProps> = ({
  value,
  label,
  className = '',
}) => {
  const digitCount = value.replace(/\D/g, '').length;

  const labelRow = (
    <div className="mb-2 flex items-center justify-between">
      <div className="flex items-baseline gap-2">
        <span className={labelClass}>{label}</span>
        {digitCount > 0 && (
          <span className="text-xs text-gray-500">({digitCount} digits)</span>
        )}
      </div>
      <CopyButton value={value} tabIndex={0} />
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

export default NumericOutput;
