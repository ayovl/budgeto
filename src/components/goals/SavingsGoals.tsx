'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Target, Calendar, TrendingUp } from 'lucide-react';
import { SectionContainer } from '../ui/SectionContainer';
import { InputField } from '../ui/InputField';
import { Button } from '../ui/Button';
import { SavingsGoal } from '@/lib/supabase/types';
import { formatCurrency } from '@/lib/utils/currency';

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
  const [durationMonths, setDurationMonths] = useState('');
  
  // Auto-calculation flag to prevent infinite loops
  const [lastChangedField, setLastChangedField] = useState<'targetAmount' | 'monthlySavings' | 'dates' | 'duration' | null>(null);

  const clampMonths = (months: number) => (months < 1 ? 1 : Math.ceil(months));

  const addMonthsToDate = (start: string, monthsToAdd: number): string => {
    const startDt = new Date(start);
    const newDate = new Date(startDt);
    newDate.setMonth(newDate.getMonth() + monthsToAdd);
    return newDate.toISOString().split('T')[0];
  };

  const calculateMonthsBetween = (start: string, end: string): number => {
    const startDt = new Date(start);
    const endDt = new Date(end);
    if (Number.isNaN(startDt.getTime()) || Number.isNaN(endDt.getTime()) || endDt <= startDt) {
      return 0;
    }

    const diffTime = endDt.getTime() - startDt.getTime();
    const months = diffTime / (1000 * 60 * 60 * 24 * 30);
    return clampMonths(months);
  };

  useEffect(() => {
    const target = parseFloat(targetAmount);
    if (!target || !startDate) {
      return;
    }

    if ((lastChangedField === 'dates' || lastChangedField === 'targetAmount' || lastChangedField === null) && targetDate) {
      const months = calculateMonthsBetween(startDate, targetDate);
      if (months > 0 && durationMonths !== months.toString()) {
        setDurationMonths(months.toString());
      }

      if (months > 0 && (lastChangedField === 'dates' || lastChangedField === 'targetAmount' || (!monthlySavings && lastChangedField === null))) {
        const monthly = target / months;
        const formatted = Math.max(1, Math.round(monthly)).toString();
        if (monthly > 0 && monthlySavings !== formatted) {
          setMonthlySavings(formatted);
        }
      }
    } else if ((lastChangedField === 'targetAmount' || lastChangedField === null) && durationMonths) {
      const months = parseInt(durationMonths, 10);
      if (months > 0) {
        const monthly = target / months;
        const formatted = Math.max(1, Math.round(monthly)).toString();
        if (monthly > 0 && monthlySavings !== formatted) {
          setMonthlySavings(formatted);
        }
        if (!targetDate) {
          const newTarget = addMonthsToDate(startDate, months);
          setTargetDate(newTarget);
        }
      }
    }
  }, [targetAmount, startDate, targetDate, durationMonths, monthlySavings, lastChangedField]);

  useEffect(() => {
    if (lastChangedField !== 'duration') return;
    const months = parseInt(durationMonths, 10);
    if (!months || months <= 0 || !startDate) return;

    const safeMonths = clampMonths(months);
    const newTarget = addMonthsToDate(startDate, safeMonths);
    if (targetDate !== newTarget) {
      setTargetDate(newTarget);
    }

    const target = parseFloat(targetAmount);
    if (target > 0) {
      const monthly = target / safeMonths;
      const formatted = Math.max(1, Math.round(monthly)).toString();
      if (monthlySavings !== formatted) {
        setMonthlySavings(formatted);
      }
    }
  }, [durationMonths, startDate, targetAmount, targetDate, monthlySavings, lastChangedField]);

  useEffect(() => {
    if (lastChangedField !== 'monthlySavings') return;
    const monthly = parseFloat(monthlySavings);
    const target = parseFloat(targetAmount);
    if (!monthly || monthly <= 0 || !target || !startDate) return;

    const monthsNeeded = clampMonths(target / monthly);
    if (durationMonths !== monthsNeeded.toString()) {
      setDurationMonths(monthsNeeded.toString());
    }

    const newTarget = addMonthsToDate(startDate, monthsNeeded);
    if (targetDate !== newTarget) {
      setTargetDate(newTarget);
    }
  }, [monthlySavings, targetAmount, startDate, durationMonths, targetDate, lastChangedField]);

  const calculateDuration = (start: string, end: string): string => {
    const months = calculateMonthsBetween(start, end);
    if (months <= 0) return '—';

    if (months < 12) return `${months} month${months !== 1 ? 's' : ''}`;

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (remainingMonths === 0) return `${years} year${years !== 1 ? 's' : ''}`;
    return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  };

  const handleSave = () => {
    if (!goalName.trim() || !targetAmount || !startDate) return;

    const target = parseFloat(targetAmount);
    if (!target || target <= 0) return;

    let months = durationMonths ? parseInt(durationMonths, 10) : 0;
    if ((!months || months <= 0) && targetDate) {
      months = calculateMonthsBetween(startDate, targetDate);
    }

    if (!months || months <= 0) {
      return;
    }

    let resolvedTargetDate = targetDate;
    if (!resolvedTargetDate) {
      resolvedTargetDate = addMonthsToDate(startDate, months);
    }

    let monthly = monthlySavings ? parseFloat(monthlySavings) : 0;
    if (!monthly || monthly <= 0) {
      monthly = Math.max(1, Math.round(target / months));
    }

    if (!resolvedTargetDate || Number.isNaN(monthly)) {
      return;
    }

    const goalData = {
      name: goalName.trim(),
      type: goalType,
      target_amount: target,
      start_date: startDate,
      target_date: resolvedTargetDate,
      monthly_savings: monthly,
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
      const months = calculateMonthsBetween(goal.start_date, goal.target_date);
      setDurationMonths(months ? months.toString() : '');
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
    setDurationMonths('');
    setEditingId(null);
    setIsAdding(false);
    setLastChangedField(null);
  };

  return (
    <SectionContainer title="Savings Goals" color="green">
      <div className="space-y-4">
        {isAdding && (
          <div className="bg-gray-900/80 p-4 rounded-lg border border-green-700/30 space-y-3">
            <InputField
              label="Goal Name"
              value={goalName}
              onChange={setGoalName}
              type="text"
              placeholder="e.g., Travel to Turkey"
            />

            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">Goal Type</label>
              <select
                value={goalType}
                onChange={(e) => setGoalType(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-900 border-2 border-gray-700 rounded-lg focus:border-green-500 focus:outline-none text-white"
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
              prefix="₹"
              min={0}
              step={100}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                label="Duration (months)"
                value={durationMonths}
                onChange={(val) => {
                  setDurationMonths(val);
                  setLastChangedField('duration');
                }}
                type="number"
                min={1}
                step={1}
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
              prefix="₹"
              min={0}
              step={10}
            />

            {startDate && targetDate && (
              <div className="bg-green-900/40 p-3 rounded-lg border border-green-700/40">
                <p className="text-sm font-medium text-green-200 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Duration: {calculateDuration(startDate, targetDate)}
                </p>
                {durationMonths && (
                  <p className="text-xs text-green-300 mt-1">
                    ≈ {(parseInt(durationMonths, 10) / 12).toFixed(1)} years
                  </p>
                )}
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
              <div key={goal.id} className="bg-green-900/30 border border-green-700/40 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-green-100">{goal.name}</h3>
                    <span className="inline-block px-2 py-1 bg-green-800/60 text-green-200 text-xs rounded-full mt-1 capitalize">
                      {goal.type.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(goal.id)}
                      className="p-2 hover:bg-green-800/70 rounded-lg transition-colors"
                      aria-label="Edit goal"
                    >
                      <TrendingUp className="w-4 h-4 text-green-200" />
                    </button>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-2 hover:bg-red-900/50 rounded-lg transition-colors text-red-400"
                      aria-label="Delete goal"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-green-200/80">Target Amount</p>
                    <p className="font-bold text-green-100">{formatCurrency(goal.target_amount)}</p>
                  </div>
                  <div>
                    <p className="text-green-200/80">Monthly Savings</p>
                    <p className="font-bold text-green-100">{formatCurrency(goal.monthly_savings)}</p>
                  </div>
                  <div>
                    <p className="text-green-200/80">Duration</p>
                    <p className="font-medium text-white">{calculateDuration(goal.start_date, goal.target_date)}</p>
                  </div>
                  <div>
                    <p className="text-green-200/80">Target Date</p>
                    <p className="font-medium text-white">{new Date(goal.target_date).toLocaleDateString()}</p>
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
