'use client';

import React from 'react';
import { MonthlyIncome } from '@/components/budget/MonthlyIncome';
import { BudgetSummary } from '@/components/expenses/BudgetSummary';
import { ExpenseSection } from '@/components/expenses/ExpenseSection';
import { SavingsGoals } from '@/components/goals/SavingsGoals';
import { InvestmentPlans } from '@/components/investments/InvestmentPlans';
import { useUserSettings, useExpenses, useSavingsGoals, useInvestmentPlans } from '@/lib/supabase/hooks';
import { Loader2, Wallet } from 'lucide-react';

export default function Home() {
  const { settings, loading: settingsLoading, updateSettings } = useUserSettings();
  const { expenses, loading: expensesLoading, addExpense, updateExpense, deleteExpense } = useExpenses();
  const { goals, loading: goalsLoading, addGoal, updateGoal, deleteGoal } = useSavingsGoals();
  const { plans, loading: plansLoading, addPlan, updatePlan, deletePlan } = useInvestmentPlans();

  const isLoading = settingsLoading || expensesLoading || goalsLoading || plansLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading your budget planner...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <p className="text-red-500">Error loading settings. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  const monthlyIncome = settings.monthly_income;
  const needsBudget = (monthlyIncome * settings.needs_percentage) / 100;
  const wantsBudget = (monthlyIncome * settings.wants_percentage) / 100;
  const savingsBudget = (monthlyIncome * settings.savings_percentage) / 100;

  const needsExpenses = expenses.filter((e) => e.category === 'needs');
  const wantsExpenses = expenses.filter((e) => e.category === 'wants');
  const savingsExpenses = expenses.filter((e) => e.category === 'savings');

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalBudget = monthlyIncome; // Total budget is simply the monthly income
  const totalRemaining = totalBudget - totalSpent;

  const handleIncomeChange = async (newIncome: number) => {
    try {
      await updateSettings({ monthly_income: newIncome });
    } catch (error) {
      console.error('Error updating income:', error);
      alert('Failed to update income. Please try again.');
    }
  };

  const handleAddExpense = async (category: 'needs' | 'wants' | 'savings', name: string, amount: number) => {
    // Get current budget for this category
    const currentBudget = category === 'needs' ? needsBudget : category === 'wants' ? wantsBudget : savingsBudget;
    
    // Check if category has budget allocated
    if (currentBudget === 0) {
      alert(`Please allocate budget to ${category} before adding expenses.`);
      return;
    }
    
    // Check if expense would exceed category budget
    const categoryExpenses = expenses.filter((e) => e.category === category);
    const currentSpent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const newTotal = currentSpent + amount;
    
    if (newTotal > currentBudget) {
      alert(`Cannot add expense. This would exceed your ${category} budget.\nBudget: ₨${currentBudget.toLocaleString()}\nCurrent Spent: ₨${currentSpent.toLocaleString()}\nTrying to add: ₨${amount.toLocaleString()}\nWould total: ₨${newTotal.toLocaleString()}`);
      return;
    }
    
    await addExpense({
      category,
      name,
      amount,
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleEditExpense = async (id: string, name: string, amount: number) => {
    // Find the expense to get its category
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;

    // Get current budget for this category
    const currentBudget = expense.category === 'needs' ? needsBudget : 
                         expense.category === 'wants' ? wantsBudget : 
                         savingsBudget;
    
    // Calculate what the new total would be
    const categoryExpenses = expenses.filter((e) => e.category === expense.category);
    const currentSpent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const oldAmount = expense.amount;
    const newTotal = currentSpent - oldAmount + amount;
    
    // Check if edit would exceed budget
    if (newTotal > currentBudget) {
      alert(`Cannot edit expense. This would exceed your ${expense.category} budget.\nBudget: ₨${currentBudget.toLocaleString()}\nCurrent Spent: ₨${currentSpent.toLocaleString()}\nTrying to change to: ₨${amount.toLocaleString()}\nWould total: ₨${newTotal.toLocaleString()}`);
      return;
    }

    await updateExpense(id, { name, amount });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm shadow-lg border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Wallet className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Budgeto</h1>
          </div>
          <p className="text-sm text-gray-400 mt-1">Your Personal Budget Planner</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Monthly Income Section */}
        <MonthlyIncome
          income={monthlyIncome}
          onIncomeChange={handleIncomeChange}
          needsPercentage={settings.needs_percentage}
          wantsPercentage={settings.wants_percentage}
          savingsPercentage={settings.savings_percentage}
        />

        {/* Budget Summary */}
        {monthlyIncome > 0 && (
          <BudgetSummary
            totalBudget={totalBudget}
            totalSpent={totalSpent}
            totalRemaining={totalRemaining}
          />
        )}

        {/* Expense Sections */}
        {monthlyIncome > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <ExpenseSection
              title={`Needs (${settings.needs_percentage}%)`}
              category="needs"
              color="blue"
              budget={needsBudget}
              expenses={needsExpenses}
              onBudgetChange={async (budget) => {
                // Calculate exact percentage with 2 decimal places
                const newPercentage = Math.round((budget / monthlyIncome) * 10000) / 100;
                const otherPercentages = settings.wants_percentage + settings.savings_percentage;
                
                // Only allow if total doesn't exceed 100%
                if (newPercentage + otherPercentages <= 100) {
                  await updateSettings({ needs_percentage: newPercentage });
                } else {
                  // Revert to previous value by not updating
                  alert(`Cannot set budget. Total would exceed 100% (Needs: ${newPercentage}% + Wants: ${settings.wants_percentage}% + Savings: ${settings.savings_percentage}% = ${newPercentage + otherPercentages}%)`);
                }
              }}
              onAddExpense={(name, amount) => handleAddExpense('needs', name, amount)}
              onEditExpense={handleEditExpense}
              onDeleteExpense={deleteExpense}
              defaultPlaceholder="Internet Bill"
            />

            <ExpenseSection
              title={`Wants (${settings.wants_percentage}%)`}
              category="wants"
              color="orange"
              budget={wantsBudget}
              expenses={wantsExpenses}
              onBudgetChange={async (budget) => {
                // Calculate exact percentage with 2 decimal places
                const newPercentage = Math.round((budget / monthlyIncome) * 10000) / 100;
                const otherPercentages = settings.needs_percentage + settings.savings_percentage;
                
                // Only allow if total doesn't exceed 100%
                if (newPercentage + otherPercentages <= 100) {
                  await updateSettings({ wants_percentage: newPercentage });
                } else {
                  alert(`Cannot set budget. Total would exceed 100% (Needs: ${settings.needs_percentage}% + Wants: ${newPercentage}% + Savings: ${settings.savings_percentage}% = ${newPercentage + otherPercentages}%)`);
                }
              }}
              onAddExpense={(name, amount) => handleAddExpense('wants', name, amount)}
              onEditExpense={handleEditExpense}
              onDeleteExpense={deleteExpense}
              defaultPlaceholder="Entertainment"
            />

            <ExpenseSection
              title={`Savings (${settings.savings_percentage}%)`}
              category="savings"
              color="green"
              budget={savingsBudget}
              expenses={savingsExpenses}
              onBudgetChange={async (budget) => {
                // Calculate exact percentage with 2 decimal places
                const newPercentage = Math.round((budget / monthlyIncome) * 10000) / 100;
                const otherPercentages = settings.needs_percentage + settings.wants_percentage;
                
                // Only allow if total doesn't exceed 100%
                if (newPercentage + otherPercentages <= 100) {
                  await updateSettings({ savings_percentage: newPercentage });
                } else {
                  alert(`Cannot set budget. Total would exceed 100% (Needs: ${settings.needs_percentage}% + Wants: ${settings.wants_percentage}% + Savings: ${newPercentage}% = ${newPercentage + otherPercentages}%)`);
                }
              }}
              onAddExpense={(name, amount) => handleAddExpense('savings', name, amount)}
              onEditExpense={handleEditExpense}
              onDeleteExpense={deleteExpense}
              defaultPlaceholder="Emergency Fund"
            />
          </div>
        )}

        {/* Savings Goals */}
        <SavingsGoals
          goals={goals}
          onAddGoal={addGoal}
          onEditGoal={updateGoal}
          onDeleteGoal={deleteGoal}
        />

        {/* Investment Plans */}
        <InvestmentPlans
          plans={plans}
          onAddPlan={addPlan}
          onEditPlan={updatePlan}
          onDeletePlan={deletePlan}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-sm text-gray-600">
            Built with Next.js, Supabase & Recharts
          </p>
        </div>
      </footer>
    </div>
  );
}
