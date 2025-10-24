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
  onBudgetChange: (budget: number) => void;
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
  onBudgetChange,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  defaultPlaceholder = 'New expense',
}) => {
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [budgetInput, setBudgetInput] = useState(budget.toString());
  const [lastBudget, setLastBudget] = useState(budget);

  React.useEffect(() => {
    // Only update input if the budget prop changed from external source
    if (budget !== lastBudget) {
      setBudgetInput(budget.toString());
      setLastBudget(budget);
    }
  }, [budget, lastBudget]);

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remaining = budget - totalSpent;

  const handleAddExpense = () => {
    if (expenseName.trim() && parseFloat(expenseAmount) > 0) {
      const amount = parseFloat(expenseAmount);
      
      // If budget is 0, automatically set budget to the expense amount
      if (budget === 0) {
        onBudgetChange(amount);
      }
      
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

  const handleBudgetUpdate = () => {
    const newBudget = parseFloat(budgetInput) || 0;
    setLastBudget(newBudget);
    onBudgetChange(newBudget);
  };

  return (
    <SectionContainer title={title} color={color} className="h-full">
      <div className="space-y-4">
        {/* Budget Setting */}
        <div>
          <div className="flex gap-2 mb-3">
            <InputField
              label="Budget"
              value={budgetInput}
              onChange={setBudgetInput}
              type="number"
              prefix="₨"
              min={0}
              step={50}
              className="flex-1"
              onEnter={handleBudgetUpdate}
            />
            <div className="flex items-end">
              <Button onClick={handleBudgetUpdate} size="sm">
                Set
              </Button>
            </div>
          </div>

          {/* Budget Summary */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center p-2 bg-gray-900/60 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-400">Budget</p>
              <p className="text-sm font-bold text-gray-100">{formatCurrency(budget)}</p>
            </div>
            <div className="text-center p-2 bg-gray-900/60 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-400">Spent</p>
              <p className="text-sm font-bold text-red-400">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="text-center p-2 bg-gray-900/60 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-400">Remaining</p>
              <p className={`text-sm font-bold ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(remaining)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <ProgressBar current={totalSpent} total={budget} color={color} showPercentage={false} />
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
