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
          <div className="w-full max-w-6xl h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px] flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-xl md:text-2xl lg:text-3xl">No budget data to display</p>
              <p className="text-base md:text-lg mt-4">Add some expenses to see your budget allocation</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-center px-4">
        {/* CSS-based Pie Chart - HUGE on Desktop */}
        <div className="w-full max-w-6xl h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px] xl:h-[900px] relative flex items-center justify-center">
          
          {/* Pie Chart using CSS conic-gradient */}
          <div 
            className="w-[350px] h-[350px] sm:w-[450px] sm:h-[450px] md:w-[550px] md:h-[550px] lg:w-[650px] lg:h-[650px] xl:w-[750px] xl:h-[750px] rounded-full shadow-2xl relative"
            style={{
              background: `conic-gradient(${gradientString})`,
            }}
          >
            {/* Inner circle to create donut effect */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px] sm:w-[180px] sm:h-[180px] md:w-[220px] md:h-[220px] lg:w-[260px] lg:h-[260px] xl:w-[300px] xl:h-[300px] bg-gray-950 rounded-full flex items-center justify-center border-4 border-white/20">
              {/* Center total display */}
              <div className="text-center">
                <div className="text-xs sm:text-sm md:text-base text-gray-300 mb-1 sm:mb-2">Total Income</div>
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-1 sm:mb-2">
                  {formatCurrency(monthlyIncome)}
                </div>
                {remaining > 0 && (
                  <>
                    <div className="text-xs sm:text-sm text-green-300 mt-1 sm:mt-2">Available</div>
                    <div className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-green-200">
                      {formatCurrency(remaining)}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Floating labels positioned around the pie */}
          {data.map((item, index) => {
            const total = data.reduce((sum, d) => sum + d.value, 0);
            const percentage = (item.value / total) * 100;
            
            // Calculate position for each label (positioning them around the pie)
            let cumulativePercent = 0;
            for (let i = 0; i < index; i++) {
              cumulativePercent += (data[i].value / total) * 100;
            }
            const midPercent = cumulativePercent + (percentage / 2);
            const angle = (midPercent / 100) * 360 - 90; // Start from top
            const radians = (angle * Math.PI) / 180;
            
            // Position labels outside the pie chart
            const radius = window.innerWidth >= 1280 ? 420 : // xl
                          window.innerWidth >= 1024 ? 370 : // lg  
                          window.innerWidth >= 768 ? 320 : // md
                          window.innerWidth >= 640 ? 270 : // sm
                          220; // base
            
            const x = Math.cos(radians) * radius;
            const y = Math.sin(radians) * radius;
            
            return percentage > 5 ? ( // Only show labels for segments > 5%
              <div
                key={index}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white rounded-lg p-2 sm:p-3 md:p-4 border border-white/20 backdrop-blur-sm shadow-xl"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                }}
              >
                <div className="text-center min-w-20 sm:min-w-24 md:min-w-28">
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1">
                    {Math.round(percentage)}%
                  </div>
                  <div className="text-sm sm:text-base md:text-lg font-semibold mb-1">
                    {item.name}
                  </div>
                  <div className="text-xs sm:text-sm md:text-base opacity-90">
                    {formatCurrency(item.value)}
                  </div>
                </div>
              </div>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
};
