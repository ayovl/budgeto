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
  monthlyIncome: number;
  totalSpentAcrossAll: number;
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
  monthlyIncome,
  totalSpentAcrossAll,
}) => {
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [inputMode, setInputMode] = useState<'amount' | 'percentage'>('amount');
  const [expensePercentage, setExpensePercentage] = useState('');

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  // Calculate remaining budget for percentage input
  const remainingBudget = monthlyIncome - totalSpentAcrossAll;
  const remainingPercentage = monthlyIncome > 0 ? Math.round(((remainingBudget / monthlyIncome) * 100)) : 0;
  
  // Calculate amount from percentage input - percentage of REMAINING budget, not monthly income
  const calculateAmountFromPercentage = (percentage: number): number => {
    return Math.round((percentage / 100) * remainingBudget);
  };

  const handleAddExpense = () => {
    let amount = 0;
    
    if (inputMode === 'amount') {
      if (!expenseName.trim() || expenseAmount === '' || parseFloat(expenseAmount) < 0) return;
      amount = parseFloat(expenseAmount) || 0; // Allow 0 amounts
    } else {
      if (!expenseName.trim() || !expensePercentage || parseFloat(expensePercentage) <= 0) return;
      const percentage = parseFloat(expensePercentage);
      if (percentage > remainingPercentage) {
        alert(`Cannot allocate ${percentage}%. Only ${remainingPercentage}% remaining.`);
        return;
      }
      amount = calculateAmountFromPercentage(percentage);
    }
    
    onAddExpense(expenseName.trim(), amount);
    setExpenseName('');
    setExpenseAmount('');
    setExpensePercentage('');
    setIsAddingExpense(false);
  };

  const handleEditExpense = (id: string) => {
    const expense = expenses.find((e) => e.id === id);
    if (expense) {
      setExpenseName(expense.name);
      setExpenseAmount(expense.amount.toString());
      setExpensePercentage(''); // Clear percentage when editing existing expense
      setInputMode('amount'); // Default to amount mode for editing
      setEditingExpenseId(id);
      setIsAddingExpense(true);
    }
  };

  const handleSaveEdit = () => {
    if (!editingExpenseId || !expenseName.trim()) return;
    
    let amount = 0;
    if (inputMode === 'amount') {
      if (expenseAmount === '' || parseFloat(expenseAmount) < 0) return;
      amount = parseFloat(expenseAmount) || 0; // Allow 0 amounts
    } else {
      if (!expensePercentage || parseFloat(expensePercentage) <= 0) return;
      const percentage = parseFloat(expensePercentage);
      if (percentage > remainingPercentage) {
        alert(`Cannot allocate ${percentage}%. Only ${remainingPercentage}% remaining.`);
        return;
      }
      amount = calculateAmountFromPercentage(percentage);
    }
    
    onEditExpense(editingExpenseId, expenseName.trim(), amount);
    setExpenseName('');
    setExpenseAmount('');
    setExpensePercentage('');
    setEditingExpenseId(null);
    setIsAddingExpense(false);
  };

  const handleCancelEdit = () => {
    setExpenseName('');
    setExpenseAmount('');
    setExpensePercentage('');
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
            
            {/* Input Mode Toggle - Only show for adding new expenses */}
            {!editingExpenseId && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-300 block">Input Mode</label>
                <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setInputMode('amount')}
                    className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors ${
                      inputMode === 'amount'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Amount
                  </button>
                  <button
                    onClick={() => setInputMode('percentage')}
                    className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors ${
                      inputMode === 'percentage'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Percentage
                  </button>
                </div>
              </div>
            )}
            
            {/* Amount Input */}
            {inputMode === 'amount' && (
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
            )}
            
            {/* Percentage Input */}
            {inputMode === 'percentage' && !editingExpenseId && (
              <div className="space-y-2">
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
                  <p className="text-xs text-gray-400 mb-1">Available to Allocate</p>
                  <p className="text-sm font-semibold text-green-400">
                    {remainingPercentage}% = {formatCurrency(remainingBudget)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Percentage is calculated from remaining budget
                  </p>
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-300">Percentage</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={expensePercentage}
                      onChange={(e) => setExpensePercentage(e.target.value)}
                      min={0}
                      max={remainingPercentage}
                      step={0.1}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddExpense()}
                      placeholder="0"
                      className="w-full px-3 py-2 pr-8 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                      %
                    </span>
                  </div>
                </div>
                
                {expensePercentage && parseFloat(expensePercentage) > 0 && (
                  <div className="bg-gray-800/30 rounded-lg p-2 border border-gray-600">
                    <p className="text-xs text-gray-400">Will add:</p>
                    <p className="text-sm font-medium text-blue-400">
                      {formatCurrency(calculateAmountFromPercentage(parseFloat(expensePercentage)))}
                    </p>
                  </div>
                )}
              </div>
            )}
            
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
