import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

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
    blue: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
    orange: 'bg-orange-100 hover:bg-orange-200 text-orange-700',
    green: 'bg-green-100 hover:bg-green-200 text-green-700',
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${colorClasses[color]} transition-colors`}>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{name}</p>
        <p className="text-sm font-semibold">${amount.toFixed(2)}</p>
      </div>
      <div className="flex gap-2 ml-2">
        <button
          onClick={() => onEdit(id)}
          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          aria-label="Edit expense"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(id)}
          className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
          aria-label="Delete expense"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
