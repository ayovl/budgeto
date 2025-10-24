'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';

interface BudgetSummaryProps {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({
  totalBudget,
  totalSpent,
  totalRemaining,
}) => {
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const isOverBudget = totalRemaining < 0;

  return (
    <div className="bg-linear-to-br from-purple-600/90 to-blue-600/90 text-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-purple-500/30">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold">Budget Overview</h2>
        <Wallet className="w-8 h-8 sm:w-10 sm:h-10" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <p className="text-sm opacity-90 mb-1">Total Budget</p>
          <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(totalBudget)}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm opacity-90">Total Spent</p>
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(totalSpent)}</p>
          <p className="text-xs opacity-75 mt-1">{spentPercentage.toFixed(1)}% of budget</p>
        </div>

        <div className={`backdrop-blur-sm rounded-xl p-4 ${isOverBudget ? 'bg-red-500/30' : 'bg-green-500/30'}`}>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm opacity-90">Remaining</p>
            <TrendingDown className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold">
            {formatCurrency(Math.abs(totalRemaining))}
          </p>
          {isOverBudget && (
            <p className="text-xs mt-1 font-semibold">Over Budget!</p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${isOverBudget ? 'bg-red-400' : 'bg-green-400'}`}
          style={{ width: `${Math.min(spentPercentage, 100)}%` }}
        />
      </div>
    </div>
  );
};
