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

  // Use the correct percentages from budget sections, not calculated from spent amounts
  const totalPercentage = data.reduce((sum, item) => sum + item.percentage, 0);
  
  // Create conic gradient string for CSS using actual budget percentages
  let gradientString = '';
  let currentPercentage = 0;
  
  data.forEach((item, index) => {
    // Use the actual percentage from the budget section
    const percentage = item.percentage;
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
        {/* Beautiful Pie Chart with Labels ON Slices */}
        <div className="w-full max-w-5xl h-[450px] sm:h-[550px] md:h-[650px] lg:h-[700px] relative flex items-center justify-center">
          
          {/* Pie Chart using CSS conic-gradient with enhanced styling */}
          <div 
            className="w-80 h-80 sm:w-[420px] sm:h-[420px] md:w-[520px] md:h-[520px] lg:w-[600px] lg:h-[600px] rounded-full relative"
            style={{
              background: `conic-gradient(${gradientString})`,
              boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.9), 0 0 0 2px rgba(255, 255, 255, 0.1)',
              filter: 'drop-shadow(0 15px 35px rgba(0, 0, 0, 0.6))',
            }}
          >
            {/* Labels positioned ON the pie slices */}
            {data.map((item, index) => {
              // Calculate angle for label position
              let cumulativePercent = 0;
              for (let i = 0; i < index; i++) {
                cumulativePercent += data[i].percentage;
              }
              const midPercent = cumulativePercent + (item.percentage / 2);
              const angle = (midPercent / 100) * 360 - 90; // Start from top
              const radians = (angle * Math.PI) / 180;
              
              // Position labels at 70% of radius from center
              const radiusPercent = 70;
              const x = Math.cos(radians) * radiusPercent;
              const y = Math.sin(radians) * radiusPercent;
              
              // Only show labels for segments > 5%
              if (item.percentage < 5) return null;
              
              return (
                <div
                  key={index}
                  className="absolute"
                  style={{
                    left: `calc(50% + ${x}%)`,
                    top: `calc(50% + ${y}%)`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="bg-black/85 backdrop-blur-md rounded-xl p-2 sm:p-3 md:p-4 border border-white/30 shadow-2xl min-w-[90px] sm:min-w-[110px] md:min-w-[130px]">
                    <div className="text-center">
                      {/* Percentage - Bold and Large */}
                      <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white mb-1">
                        {item.percentage}%
                      </div>
                      {/* Category Name */}
                      <div className="text-xs sm:text-sm md:text-base font-bold text-white/90 mb-1">
                        {item.name}
                      </div>
                      {/* Amount */}
                      <div className="text-xs sm:text-sm md:text-base font-semibold text-white/80">
                        {formatCurrency(item.value)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Inner circle to create donut effect with enhanced styling */}
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-44 sm:h-44 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, #0a0a1a, #1a1a30)',
                border: '4px solid rgba(255, 255, 255, 0.15)',
                boxShadow: 'inset 0 4px 20px rgba(0, 0, 0, 0.5), 0 8px 32px rgba(0, 0, 0, 0.6)',
              }}
            >
              {/* Center total display */}
              <div className="text-center px-3">
                <div className="text-xs sm:text-sm md:text-base text-gray-300 mb-1 sm:mb-2">Total Income</div>
                <div className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black text-white mb-1 sm:mb-2">
                  {formatCurrency(monthlyIncome)}
                </div>
                {remaining > 0 && (
                  <>
                    <div className="text-xs sm:text-sm text-green-300 mt-1 sm:mt-2">Available</div>
                    <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-green-200">
                      {formatCurrency(remaining)}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
