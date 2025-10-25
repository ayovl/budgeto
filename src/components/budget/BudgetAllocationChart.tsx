'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/utils/currency';

interface BudgetAllocationChartProps {
  needs: number;
  wants: number;
  savings: number;
  monthlyIncome: number;
  needsPercentage: number;
  wantsPercentage: number;
  savingsPercentage: number;
}

export const BudgetAllocationChart: React.FC<BudgetAllocationChartProps> = ({
  needs,
  wants,
  savings,
  monthlyIncome,
  needsPercentage,
  wantsPercentage,
  savingsPercentage,
}) => {
  const totalSpent = needs + wants + savings;
  const remaining = Math.max(0, monthlyIncome - totalSpent);
  const remainingPercentage = monthlyIncome > 0 ? Math.round((remaining / monthlyIncome) * 100) : 0;
  
  const data = [
    { name: 'Needs', value: needs, color: '#3b82f6', percentage: needsPercentage },
    { name: 'Wants', value: wants, color: '#f97316', percentage: wantsPercentage },
    { name: 'Savings', value: savings, color: '#22c55e', percentage: savingsPercentage },
    { name: 'Remaining', value: remaining, color: '#6b7280', percentage: remainingPercentage },
  ].filter(item => item.value > 0); // Only show categories with values > 0

  const COLORS = ['#3b82f6', '#f97316', '#22c55e', '#6b7280'];

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
        {/* Pie Chart */}
        <div className="w-full lg:w-1/2 h-[280px] sm:h-80 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={20}
                fill="#8884d8"
                dataKey="value"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* External Labels */}
        <div className="w-full lg:w-1/2 space-y-3 sm:space-y-4">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center justify-between p-3 sm:p-4 bg-gray-900/40 border border-gray-700/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white/20" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm sm:text-base font-medium text-gray-200">
                  {entry.name}
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-xl font-bold text-white">
                  {formatCurrency(entry.value)}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">
                  {entry.percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Budget Summary */}
      {monthlyIncome > 0 && (
        <div className="mt-6 p-4 bg-linear-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/30 rounded-xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left">
            <div>
              <span className="text-sm text-gray-300">Total Income: </span>
              <span className="text-lg font-semibold text-white">{formatCurrency(monthlyIncome)}</span>
            </div>
            <div>
              <span className="text-sm text-gray-300">Total Allocated: </span>
              <span className="text-lg font-semibold text-white">{formatCurrency(totalSpent)}</span>
            </div>
            {remaining > 0 && (
              <div>
                <span className="text-sm text-green-300">Available: </span>
                <span className="text-lg font-semibold text-green-200">{formatCurrency(remaining)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
