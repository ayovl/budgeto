'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, LabelList } from 'recharts';
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
    { name: 'Needs', value: needs, color: '#4f46e5', percentage: needsPercentage },
    { name: 'Wants', value: wants, color: '#f59e0b', percentage: wantsPercentage },
    { name: 'Savings', value: savings, color: '#10b981', percentage: savingsPercentage },
    { name: 'Remaining', value: remaining, color: '#8b5cf6', percentage: remainingPercentage },
  ].filter(item => item.value > 0); // Only show categories with values > 0

  // Enhanced colors with gradients
  const gradientColors = [
    'url(#needsGradient)',
    'url(#wantsGradient)', 
    'url(#savingsGradient)',
    'url(#remainingGradient)'
  ];

  // Custom label component with better spacing and readability
  const renderCombinedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.08) return null; // Don't show label for very small slices

    return (
      <g>
        {/* Background for better readability */}
        <rect
          x={x - 45}
          y={y - 22}
          width={90}
          height={44}
          rx={8}
          fill="rgba(0,0,0,0.7)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1}
        />
        
        {/* Percentage */}
        <text
          x={x}
          y={y - 8}
          fill="white"
          textAnchor="middle"
          dominantBaseline="central"
          className="font-bold text-xl"
          style={{ filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))' }}
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
        
        {/* Category name */}
        <text
          x={x}
          y={y + 6}
          fill="white"
          textAnchor="middle"
          dominantBaseline="central"
          className="font-semibold text-sm"
          style={{ filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))' }}
        >
          {name}
        </text>
        
        {/* Amount */}
        <text
          x={x}
          y={y + 18}
          fill="white"
          textAnchor="middle"
          dominantBaseline="central"
          className="font-medium text-xs opacity-95"
          style={{ filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))' }}
        >
          {formatCurrency(value)}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full">
      <div className="flex justify-center px-4">
        {/* Enhanced Pie Chart - Much Larger */}
        <div className="w-full max-w-4xl h-[600px] sm:h-[700px] lg:h-[800px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {/* Gradient definitions */}
                <linearGradient id="needsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
                <linearGradient id="wantsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
                <linearGradient id="savingsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <linearGradient id="remainingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCombinedLabel}
                outerRadius={180}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth={3}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={gradientColors[index % gradientColors.length]}
                    style={{
                      filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.4))',
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center total display - Enhanced */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="bg-gray-900/95 rounded-full p-8 border-2 border-white/30 backdrop-blur-sm shadow-2xl">
              <div className="text-sm text-gray-300 mb-2">Total Income</div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                {formatCurrency(monthlyIncome)}
              </div>
              {remaining > 0 && (
                <>
                  <div className="text-xs text-green-300 mt-3">Available</div>
                  <div className="text-lg font-semibold text-green-200">
                    {formatCurrency(remaining)}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
