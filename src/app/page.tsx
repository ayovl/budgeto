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
    // Add the expense first
    await addExpense({
      category,
      name,
      amount,
      date: new Date().toISOString().split('T')[0],
    });

    // Calculate new total for this category
    const categoryExpenses = expenses.filter((e) => e.category === category);
    const currentSpent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const newTotal = currentSpent + amount;

    // Calculate what percentage this new total represents
    if (monthlyIncome > 0) {
      const newPercentage = Math.round((newTotal / monthlyIncome) * 10000) / 100;
      
      // Update the percentage for this category
      const updateKey = category === 'needs' ? 'needs_percentage' : 
                       category === 'wants' ? 'wants_percentage' : 
                       'savings_percentage';
      
      await updateSettings({ [updateKey]: newPercentage });
    }
  };

  const handleEditExpense = async (id: string, name: string, amount: number) => {
    // Find the expense to get its category
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;

    // Update the expense
    await updateExpense(id, { name, amount });

    // Recalculate total for this category
    const categoryExpenses = expenses.filter((e) => e.category === expense.category);
    const currentSpent = categoryExpenses.reduce((sum, exp) => {
      // Use new amount for the edited expense, old amount for others
      return sum + (exp.id === id ? amount : exp.amount);
    }, 0);

    // Update percentage
    if (monthlyIncome > 0) {
      const newPercentage = Math.round((currentSpent / monthlyIncome) * 10000) / 100;
      const updateKey = expense.category === 'needs' ? 'needs_percentage' : 
                       expense.category === 'wants' ? 'wants_percentage' : 
                       'savings_percentage';
      
      await updateSettings({ [updateKey]: newPercentage });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    // Find the expense to get its category and amount
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;

    // Delete the expense
    await deleteExpense(id);

    // Recalculate total for this category (excluding the deleted expense)
    const categoryExpenses = expenses.filter((e) => e.category === expense.category && e.id !== id);
    const newTotal = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Update percentage
    if (monthlyIncome > 0) {
      const newPercentage = Math.round((newTotal / monthlyIncome) * 10000) / 100;
      const updateKey = expense.category === 'needs' ? 'needs_percentage' : 
                       expense.category === 'wants' ? 'wants_percentage' : 
                       'savings_percentage';
      
      await updateSettings({ [updateKey]: newPercentage });
    }
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
              onAddExpense={(name, amount) => handleAddExpense('needs', name, amount)}
              onEditExpense={handleEditExpense}
              onDeleteExpense={handleDeleteExpense}
              defaultPlaceholder="Internet Bill"
            />

            <ExpenseSection
              title={`Wants (${settings.wants_percentage}%)`}
              category="wants"
              color="orange"
              budget={wantsBudget}
              expenses={wantsExpenses}
              onAddExpense={(name, amount) => handleAddExpense('wants', name, amount)}
              onEditExpense={handleEditExpense}
              onDeleteExpense={handleDeleteExpense}
              defaultPlaceholder="Entertainment"
            />

            <ExpenseSection
              title={`Savings (${settings.savings_percentage}%)`}
              category="savings"
              color="green"
              budget={savingsBudget}
              expenses={savingsExpenses}
              onAddExpense={(name, amount) => handleAddExpense('savings', name, amount)}
              onEditExpense={handleEditExpense}
              onDeleteExpense={handleDeleteExpense}
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
