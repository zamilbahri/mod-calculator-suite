import type { MathValidationError } from '../../utils/numberTheory';
import MathText from './MathText';

export const MathErrorView: React.FC<{ error: MathValidationError }> = ({
  error,
}) => {
  return (
    <span>
      <MathText>{error.fieldNames.join(', ')}</MathText> {error.reason}
      {error.expectedValue ? ` ${error.expectedValue}` : ''}
    </span>
  );
};
