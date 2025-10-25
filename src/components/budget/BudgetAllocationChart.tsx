'use client';

import React from 'react';
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
  
  // Create data array with proper filtering for zero values
  const allData = [
    { name: 'Needs', value: needs, color: '#4f46e5', percentage: needsPercentage, bgColor: 'bg-indigo-500' },
    { name: 'Wants', value: wants, color: '#f59e0b', percentage: wantsPercentage, bgColor: 'bg-amber-500' },
    { name: 'Savings', value: savings, color: '#10b981', percentage: savingsPercentage, bgColor: 'bg-emerald-500' },
    { name: 'Remaining', value: remaining, color: '#8b5cf6', percentage: remainingPercentage, bgColor: 'bg-violet-500' },
  ];
  
  // Filter out items with zero or very small values (less than 1 to account for rounding)
  const data = allData.filter(item => item.value >= 1);

  // Calculate percentages for the pie chart
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Create conic gradient string for CSS
  let gradientString = '';
  let currentPercentage = 0;
  
  data.forEach((item, index) => {
    const percentage = (item.value / total) * 100;
    if (index > 0) gradientString += ', ';
    gradientString += `${item.color} ${currentPercentage}% ${currentPercentage + percentage}%`;
    currentPercentage += percentage;
  });

  // If no data to display, show a message
  if (data.length === 0) {
    return (
      <div className="w-full">
        <div className="flex justify-center px-4">
          <div className="w-full max-w-4xl h-[400px] flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg md:text-xl">No budget data to display</p>
              <p className="text-sm md:text-base mt-2">Add some expenses to see your budget allocation</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-center px-2 sm:px-4">
        {/* Enhanced Pie Chart - Properly Sized */}
        <div className="w-full max-w-4xl h-[400px] sm:h-[500px] lg:h-[600px] relative flex items-center justify-center">
          
          {/* Pie Chart using CSS conic-gradient with enhanced styling */}
          <div 
            className="w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] lg:w-[480px] lg:h-[480px] rounded-full relative"
            style={{
              background: `conic-gradient(${gradientString})`,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.5))',
            }}
          >
            {/* Inner circle to create donut effect with enhanced styling */}
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, #0f0f23, #1a1a2e)',
                border: '3px solid rgba(255, 255, 255, 0.1)',
                boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.3), 0 4px 20px rgba(0, 0, 0, 0.4)',
              }}
            >
              {/* Center total display */}
              <div className="text-center px-2">
                <div className="text-xs sm:text-sm text-gray-300 mb-1">Total Income</div>
                <div className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-1">
                  {formatCurrency(monthlyIncome)}
                </div>
                {remaining > 0 && (
                  <>
                    <div className="text-xs text-green-300 mt-1">Available</div>
                    <div className="text-xs sm:text-sm md:text-base font-semibold text-green-200">
                      {formatCurrency(remaining)}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
        
        {/* Legend below the pie chart */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto px-4">
          {data.map((item, index) => {
            const percentage = Math.round((item.value / total) * 100);
            return (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-300 mt-1">
                      {formatCurrency(item.value)}
                    </div>
                    <div className="text-xs font-bold text-gray-100 mt-1">
                      {percentage}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
