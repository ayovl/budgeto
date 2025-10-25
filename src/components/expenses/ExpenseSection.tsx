'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { SectionContainer } from '../ui/SectionContainer';
import { InputField } from '../ui/InputField';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { ExpenseItem } from '../ui/ExpenseItem';
import { Expense } from '@/lib/supabase/types';
import { formatCurrency } from '@/lib/utils/currency';

interface ExpenseSectionProps {
  title: string;
  category: 'needs' | 'wants' | 'savings';
  color: 'blue' | 'orange' | 'green';
  budget: number;
  expenses: Expense[];
  onAddExpense: (name: string, amount: number) => void;
  onEditExpense: (id: string, name: string, amount: number) => void;
  onDeleteExpense: (id: string) => void;
  defaultPlaceholder?: string;
}

export const ExpenseSection: React.FC<ExpenseSectionProps> = ({
  title,
  category,
  color,
  budget,
  expenses,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  defaultPlaceholder = 'New expense',
}) => {
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handleAddExpense = () => {
    if (expenseName.trim() && parseFloat(expenseAmount) > 0) {
      const amount = parseFloat(expenseAmount);
      
      onAddExpense(expenseName.trim(), amount);
      setExpenseName('');
      setExpenseAmount('');
      setIsAddingExpense(false);
    }
  };

  const handleEditExpense = (id: string) => {
    const expense = expenses.find((e) => e.id === id);
    if (expense) {
      setExpenseName(expense.name);
      setExpenseAmount(expense.amount.toString());
      setEditingExpenseId(id);
      setIsAddingExpense(true);
    }
  };

  const handleSaveEdit = () => {
    if (editingExpenseId && expenseName.trim() && parseFloat(expenseAmount) > 0) {
      onEditExpense(editingExpenseId, expenseName.trim(), parseFloat(expenseAmount));
      setExpenseName('');
      setExpenseAmount('');
      setEditingExpenseId(null);
      setIsAddingExpense(false);
    }
  };

  const handleCancelEdit = () => {
    setExpenseName('');
    setExpenseAmount('');
    setEditingExpenseId(null);
    setIsAddingExpense(false);
  };

  return (
    <SectionContainer title={title} color={color} className="h-full">
      <div className="space-y-4">
        {/* Total Expenses Display */}
        <div className="bg-gray-900/60 rounded-lg border border-gray-700 p-3">
          <p className="text-xs text-gray-400 text-center mb-1">Total Expenses</p>
          <p className="text-xl font-bold text-center text-gray-100">{formatCurrency(totalSpent)}</p>
        </div>

        {/* Add/Edit Expense Form */}
        {isAddingExpense && (
          <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-700 space-y-3">
            <InputField
              label="Expense Name"
              value={expenseName}
              onChange={setExpenseName}
              type="text"
              placeholder={defaultPlaceholder}
              onEnter={editingExpenseId ? handleSaveEdit : handleAddExpense}
            />
            <InputField
              label="Amount"
              value={expenseAmount}
              onChange={setExpenseAmount}
              type="number"
              prefix="₨"
              min={0}
              step={0.01}
              onEnter={editingExpenseId ? handleSaveEdit : handleAddExpense}
            />
            <div className="flex gap-2">
              <Button
                onClick={editingExpenseId ? handleSaveEdit : handleAddExpense}
                variant="success"
                size="sm"
                className="flex-1"
              >
                {editingExpenseId ? 'Update' : 'Add'}
              </Button>
              <Button onClick={handleCancelEdit} variant="secondary" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Add Expense Button */}
        {!isAddingExpense && (
          <Button
            onClick={() => setIsAddingExpense(true)}
            variant="secondary"
            className="w-full flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        )}

        {/* Expenses List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {expenses.length === 0 ? (
            <p className="text-center text-gray-500 py-4 text-sm">No expenses yet</p>
          ) : (
            expenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                id={expense.id}
                name={expense.name}
                amount={expense.amount}
                onEdit={handleEditExpense}
                onDelete={onDeleteExpense}
                color={color}
              />
            ))
          )}
        </div>
      </div>
    </SectionContainer>
  );
};
