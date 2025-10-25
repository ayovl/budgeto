'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Target, Calendar, TrendingUp, PiggyBank, Edit3 } from 'lucide-react';
import { SectionContainer } from '../ui/SectionContainer';
import { InputField } from '../ui/InputField';
import { Button } from '../ui/Button';
import { SavingsGoal } from '@/lib/supabase/types';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDateReadable, calculateRemainingMonths, calculateNewTargetDate } from '@/lib/utils/dateHelpers';

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
  const [goalCategory, setGoalCategory] = useState<'needs' | 'wants' | 'savings'>('savings');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentSaved, setCurrentSaved] = useState('');
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
    if (!goalName.trim() || !targetAmount || !startDate || !targetDate) return;

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

    const savedAmount = currentSaved ? parseFloat(currentSaved) : 0;
    const goalData = {
      name: goalName.trim(),
      type: goalType,
      category: goalCategory,
      target_amount: target,
      current_saved: Math.max(0, savedAmount), // Use input amount or 0
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
      setGoalCategory(goal.category || 'savings'); // Default to savings for existing goals
      setTargetAmount(goal.target_amount.toString());
      setCurrentSaved(goal.current_saved.toString());
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
    setGoalCategory('savings');
    setTargetAmount('');
    setCurrentSaved('');
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
              onEnter={handleSave}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Budget Category</label>
                <select
                  value={goalCategory}
                  onChange={(e) => setGoalCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-900 border-2 border-gray-700 rounded-lg focus:border-green-500 focus:outline-none text-white"
                >
                  <option value="needs">Needs (Essential expenses)</option>
                  <option value="wants">Wants (Lifestyle expenses)</option>
                  <option value="savings">Savings (Financial goals)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputField
                label="Target Amount"
                value={targetAmount}
                onChange={(val) => {
                  setTargetAmount(val);
                  setLastChangedField('targetAmount');
                }}
                type="number"
                prefix="₨"
                min={0}
                step={100}
                onEnter={handleSave}
              />

              <InputField
                label={editingId ? "Current Saved Amount" : "Initial Amount (if any)"}
                value={currentSaved}
                onChange={setCurrentSaved}
                type="number"
                prefix="₨"
                min={0}
                step={100}
                placeholder={editingId ? "Amount already saved" : "Starting amount (optional)"}
                onEnter={handleSave}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <InputField
                label="Start Date"
                value={startDate}
                onChange={(val) => {
                  setStartDate(val);
                  setLastChangedField('dates');
                }}
                type="date"
                onEnter={handleSave}
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
                onEnter={handleSave}
              />
              <InputField
                label="Target Date"
                value={targetDate}
                onChange={(val) => {
                  setTargetDate(val);
                  setLastChangedField('dates');
                }}
                type="date"
                onEnter={handleSave}
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
              prefix="₨"
              min={0}
              step={10}
              onEnter={handleSave}
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
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleEdit}
                onDelete={onDeleteGoal}
                onUpdateSavings={(id, updates) => {
                  // Create a complete goal object by merging updates with existing goal
                  const existingGoal = goals.find(g => g.id === id);
                  if (existingGoal) {
                    const updatedGoal = { ...existingGoal, ...updates };
                    onEditGoal(id, {
                      name: updatedGoal.name,
                      type: updatedGoal.type,
                      category: updatedGoal.category || 'savings',
                      target_amount: updatedGoal.target_amount,
                      current_saved: updatedGoal.current_saved,
                      start_date: updatedGoal.start_date,
                      target_date: updatedGoal.target_date,
                      monthly_savings: updatedGoal.monthly_savings,
                    });
                  }
                }}
              />
            ))
          )}
        </div>
      </div>
    </SectionContainer>
  );
};

// Individual Goal Card Component
interface GoalCardProps {
  goal: SavingsGoal;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateSavings: (id: string, updates: Partial<SavingsGoal>) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete, onUpdateSavings }) => {
  const [isAddingMoney, setIsAddingMoney] = React.useState(false);
  const [addAmount, setAddAmount] = React.useState('');
  const [isEditingSavings, setIsEditingSavings] = React.useState(false);
  const [editSavingsAmount, setEditSavingsAmount] = React.useState('');
  
  // Calculate progress
  const progress = goal.target_amount > 0 ? (goal.current_saved / goal.target_amount) * 100 : 0;
  const remaining = Math.max(0, goal.target_amount - goal.current_saved);
  
  // Calculate remaining months based on current progress
  const remainingMonths = calculateRemainingMonths(goal.target_amount, goal.current_saved, goal.monthly_savings);
  const newTargetDate = calculateNewTargetDate(goal.current_saved, goal.target_amount, goal.monthly_savings, goal.start_date, goal.target_date);
  
  const handleAddMoney = () => {
    const amount = parseFloat(addAmount);
    if (amount > 0) {
      const newCurrentSaved = goal.current_saved + amount;
      onUpdateSavings(goal.id, { 
        current_saved: newCurrentSaved,
        // Update target date based on new progress
        target_date: newCurrentSaved >= goal.target_amount ? 
          new Date().toISOString().split('T')[0] : 
          calculateNewTargetDate(newCurrentSaved, goal.target_amount, goal.monthly_savings, goal.start_date, goal.target_date)
      });
      setAddAmount('');
      setIsAddingMoney(false);
    }
  };

  const handleEditSavings = () => {
    setEditSavingsAmount(goal.current_saved.toString());
    setIsEditingSavings(true);
  };

  const handleSaveEditedSavings = () => {
    const amount = parseFloat(editSavingsAmount);
    if (amount >= 0) {
      onUpdateSavings(goal.id, { 
        current_saved: amount,
        // Update target date based on new progress
        target_date: amount >= goal.target_amount ? 
          new Date().toISOString().split('T')[0] : 
          calculateNewTargetDate(amount, goal.target_amount, goal.monthly_savings, goal.start_date, goal.target_date)
      });
      setEditSavingsAmount('');
      setIsEditingSavings(false);
    }
  };

  const handleRemoveAllSavings = () => {
    if (confirm('Are you sure you want to remove all saved money for this goal?')) {
      onUpdateSavings(goal.id, { 
        current_saved: 0,
        target_date: goal.target_date // Reset to original target date
      });
    }
  };

  const formatDuration = (months: number): string => {
    if (months <= 0) return 'Goal achieved! 🎉';
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} left`;
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (remainingMonths === 0) return `${years} year${years !== 1 ? 's' : ''} left`;
    return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''} left`;
  };

  return (
    <div className="bg-green-900/30 border border-green-700/40 rounded-2xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-2xl text-green-100 mb-2">{goal.name}</h3>
          <span className="inline-block px-3 py-1 bg-green-800/60 text-green-200 text-sm rounded-full capitalize">
            {goal.type.replace('-', ' ')}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(goal.id)}
            className="p-3 hover:bg-green-800/70 rounded-xl transition-colors"
            aria-label="Edit goal"
          >
            <Edit3 className="w-5 h-5 text-green-200" />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="p-3 hover:bg-red-900/50 rounded-xl transition-colors text-red-400"
            aria-label="Delete goal"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-green-800/30 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-green-200/80 text-sm font-medium">Progress</span>
          <span className="text-green-100 font-bold text-lg">{Math.round(progress)}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-green-900/50 rounded-full h-3">
          <div 
            className="bg-linear-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-green-200">{formatCurrency(goal.current_saved)}</span>
          <span className="text-green-100 font-medium">{formatCurrency(goal.target_amount)}</span>
        </div>
        
        {/* Edit/Remove Saved Money - Only show if money has been saved */}
        {goal.current_saved > 0 && (
          <div className="flex gap-2 pt-2 border-t border-green-700/30">
            <button
              onClick={handleEditSavings}
              className="flex-1 text-xs text-green-300 hover:text-green-200 transition-colors"
            >
              Edit Saved Amount
            </button>
            <button
              onClick={handleRemoveAllSavings}
              className="flex-1 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Remove All
            </button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-800/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <PiggyBank className="w-4 h-4 text-green-400" />
            <span className="text-green-200/80 text-sm">Monthly Savings</span>
          </div>
          <p className="font-bold text-green-100 text-lg">{formatCurrency(goal.monthly_savings)}</p>
        </div>
        
        <div className="bg-green-800/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-green-400" />
            <span className="text-green-200/80 text-sm">Remaining</span>
          </div>
          <p className="font-bold text-green-100 text-lg">{formatCurrency(remaining)}</p>
        </div>
        
        <div className="bg-green-800/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-green-400" />
            <span className="text-green-200/80 text-sm">Timeline</span>
          </div>
          <p className="font-medium text-green-100">{formatDuration(remainingMonths)}</p>
        </div>
        
        <div className="bg-green-800/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-200/80 text-sm">Target Date</span>
          </div>
          <p className="font-medium text-green-100 text-sm">{formatDateReadable(newTargetDate)}</p>
        </div>
      </div>

      {/* Add/Edit Money Section */}
      <div className="border-t border-green-700/30 pt-4 space-y-3">
        {/* Edit Savings Form */}
        {isEditingSavings && (
          <div className="space-y-3 bg-yellow-900/20 p-3 rounded-lg border border-yellow-600/30">
            <InputField
              label="Edit Total Saved Amount"
              value={editSavingsAmount}
              onChange={setEditSavingsAmount}
              type="number"
              prefix="₨"
              min={0}
              step={0.01}
              placeholder="Enter total saved amount"
              onEnter={handleSaveEditedSavings}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSaveEditedSavings}
                variant="success"
                size="sm"
                className="flex-1"
                disabled={!editSavingsAmount || parseFloat(editSavingsAmount) < 0}
              >
                Save Changes
              </Button>
              <Button 
                onClick={() => {
                  setIsEditingSavings(false);
                  setEditSavingsAmount('');
                }} 
                variant="secondary" 
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Add Money Form */}
        {!isEditingSavings && !isAddingMoney && (
          <button
            onClick={() => setIsAddingMoney(true)}
            className="w-full bg-green-700/50 hover:bg-green-700/70 border border-green-600 rounded-xl px-4 py-3 text-green-100 font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Money to Goal
          </button>
        )}
        
        {!isEditingSavings && isAddingMoney && (
          <div className="space-y-3">
            <InputField
              label="Add Amount"
              value={addAmount}
              onChange={setAddAmount}
              type="number"
              prefix="₨"
              min={0}
              step={0.01}
              placeholder="Enter amount to add"
              onEnter={handleAddMoney}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleAddMoney}
                variant="success"
                size="sm"
                className="flex-1"
                disabled={!addAmount || parseFloat(addAmount) <= 0}
              >
                Add {addAmount && formatCurrency(parseFloat(addAmount))}
              </Button>
              <Button 
                onClick={() => {
                  setIsAddingMoney(false);
                  setAddAmount('');
                }} 
                variant="secondary" 
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
