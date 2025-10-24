import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';

interface ExpenseItemProps {
  id: string;
  name: string;
  amount: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  color?: 'blue' | 'orange' | 'green';
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({
  id,
  name,
  amount,
  onEdit,
  onDelete,
  color = 'blue',
}) => {
  const colorClasses = {
    blue: 'bg-blue-900/40 hover:bg-blue-900/60 text-blue-300 border border-blue-700/30',
    orange: 'bg-orange-900/40 hover:bg-orange-900/60 text-orange-300 border border-orange-700/30',
    green: 'bg-green-900/40 hover:bg-green-900/60 text-green-300 border border-green-700/30',
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${colorClasses[color]} transition-colors`}>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{name}</p>
  <p className="text-sm font-semibold">{formatCurrency(amount)}</p>
      </div>
      <div className="flex gap-2 ml-2">
        <button
          onClick={() => onEdit(id)}
          className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
          aria-label="Edit expense"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(id)}
          className="p-2 hover:bg-red-900/50 rounded-lg transition-colors text-red-400"
          aria-label="Delete expense"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
