'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Target, Calendar, TrendingUp } from 'lucide-react';
import { SectionContainer } from '../ui/SectionContainer';
import { InputField } from '../ui/InputField';
import { Button } from '../ui/Button';
import { SavingsGoal } from '@/lib/supabase/types';
import { ExpenseItem } from '../ui/ExpenseItem';

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  onEditGoal: (id: string, goal: Omit<SavingsGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  onDeleteGoal: (id: string) => void;
}

export const SavingsGoals: React.FC<SavingsGoalsProps> = ({
  goals,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [goalName, setGoalName] = useState('');
  const [goalType, setGoalType] = useState<'short-term' | 'medium-term' | 'long-term'>('short-term');
  const [targetAmount, setTargetAmount] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState('');
  const [monthlySavings, setMonthlySavings] = useState('');
  
  // Auto-calculation flag to prevent infinite loops
  const [lastChangedField, setLastChangedField] = useState<'targetAmount' | 'monthlySavings' | 'dates' | null>(null);

  useEffect(() => {
    if (!targetAmount || !startDate || !targetDate) return;

    const target = parseFloat(targetAmount);
    const start = new Date(startDate);
    const end = new Date(targetDate);
    
    if (isNaN(target) || start >= end) return;

    const months = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));

    if (lastChangedField === 'targetAmount' || lastChangedField === 'dates') {
      // Calculate monthly savings based on target and dates
      const monthly = target / months;
      setMonthlySavings(monthly.toFixed(2));
    } else if (lastChangedField === 'monthlySavings' && monthlySavings) {
      // Calculate target date based on monthly savings and target amount
      const monthly = parseFloat(monthlySavings);
      if (monthly > 0) {
        const requiredMonths = Math.ceil(target / monthly);
        const newEndDate = new Date(start);
        newEndDate.setMonth(newEndDate.getMonth() + requiredMonths);
        setTargetDate(newEndDate.toISOString().split('T')[0]);
      }
    }
  }, [targetAmount, startDate, targetDate, monthlySavings, lastChangedField]);

  const calculateDuration = (start: string, end: string): string => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const months = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''}`;
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (remainingMonths === 0) return `${years} year${years !== 1 ? 's' : ''}`;
    return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  };

  const handleSave = () => {
    if (!goalName.trim() || !targetAmount || !startDate || !targetDate || !monthlySavings) return;

    const goalData = {
      name: goalName.trim(),
      type: goalType,
      target_amount: parseFloat(targetAmount),
      start_date: startDate,
      target_date: targetDate,
      monthly_savings: parseFloat(monthlySavings),
    };

    if (editingId) {
      onEditGoal(editingId, goalData);
    } else {
      onAddGoal(goalData);
    }

    resetForm();
  };

  const handleEdit = (id: string) => {
    const goal = goals.find((g) => g.id === id);
    if (goal) {
      setGoalName(goal.name);
      setGoalType(goal.type);
      setTargetAmount(goal.target_amount.toString());
      setStartDate(goal.start_date);
      setTargetDate(goal.target_date);
      setMonthlySavings(goal.monthly_savings.toString());
      setEditingId(id);
      setIsAdding(true);
    }
  };

  const resetForm = () => {
    setGoalName('');
    setGoalType('short-term');
    setTargetAmount('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setTargetDate('');
    setMonthlySavings('');
    setEditingId(null);
    setIsAdding(false);
    setLastChangedField(null);
  };

  return (
    <SectionContainer title="Savings Goals" color="green">
      <div className="space-y-4">
        {isAdding && (
          <div className="bg-white p-4 rounded-lg border-2 border-gray-300 space-y-3">
            <InputField
              label="Goal Name"
              value={goalName}
              onChange={setGoalName}
              type="text"
              placeholder="e.g., Travel to Turkey"
            />

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Goal Type</label>
              <select
                value={goalType}
                onChange={(e) => setGoalType(e.target.value as any)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
              >
                <option value="short-term">Short-term</option>
                <option value="medium-term">Medium-term</option>
                <option value="long-term">Long-term</option>
              </select>
            </div>

            <InputField
              label="Target Amount"
              value={targetAmount}
              onChange={(val) => {
                setTargetAmount(val);
                setLastChangedField('targetAmount');
              }}
              type="number"
              prefix="$"
              min={0}
              step={100}
            />

            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Start Date"
                value={startDate}
                onChange={(val) => {
                  setStartDate(val);
                  setLastChangedField('dates');
                }}
                type="date"
              />
              <InputField
                label="Target Date"
                value={targetDate}
                onChange={(val) => {
                  setTargetDate(val);
                  setLastChangedField('dates');
                }}
                type="date"
              />
            </div>

            <InputField
              label="Monthly Savings Required"
              value={monthlySavings}
              onChange={(val) => {
                setMonthlySavings(val);
                setLastChangedField('monthlySavings');
              }}
              type="number"
              prefix="$"
              min={0}
              step={10}
            />

            {startDate && targetDate && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Duration: {calculateDuration(startDate, targetDate)}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSave} variant="success" size="sm" className="flex-1">
                {editingId ? 'Update Goal' : 'Add Goal'}
              </Button>
              <Button onClick={resetForm} variant="secondary" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            variant="secondary"
            className="w-full flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Savings Goal
          </Button>
        )}

        <div className="space-y-3">
          {goals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No savings goals yet. Add one to get started!</p>
            </div>
          ) : (
            goals.map((goal) => (
              <div key={goal.id} className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-green-800">{goal.name}</h3>
                    <span className="inline-block px-2 py-1 bg-green-200 text-green-700 text-xs rounded-full mt-1">
                      {goal.type.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(goal.id)}
                      className="p-2 hover:bg-green-200 rounded-lg transition-colors"
                      aria-label="Edit goal"
                    >
                      <TrendingUp className="w-4 h-4 text-green-700" />
                    </button>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                      aria-label="Delete goal"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Target Amount</p>
                    <p className="font-bold text-green-700">${goal.target_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Monthly Savings</p>
                    <p className="font-bold text-green-700">${goal.monthly_savings.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-medium">{calculateDuration(goal.start_date, goal.target_date)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Target Date</p>
                    <p className="font-medium">{new Date(goal.target_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </SectionContainer>
  );
};
