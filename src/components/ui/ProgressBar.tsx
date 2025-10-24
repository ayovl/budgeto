import React from 'react';
import { formatCurrency } from '@/lib/utils/currency';

interface ProgressBarProps {
  current: number;
  total: number;
  color?: 'blue' | 'orange' | 'green';
  height?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  color = 'blue',
  height = 'md',
  showPercentage = true,
}) => {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  const colorClasses = {
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    green: 'bg-green-500',
  };

  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-800/60 rounded-full overflow-hidden ${heightClasses[height]}`}>
        <div
          className={`${colorClasses[color]} h-full rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>{formatCurrency(current)}</span>
          <span>{percentage.toFixed(1)}%</span>
          <span>{formatCurrency(total)}</span>
        </div>
      )}
    </div>
  );
};
