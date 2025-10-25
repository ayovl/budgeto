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

  // Custom label component for percentages on slices
  const renderPercentageLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label for very small slices

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="font-bold text-lg drop-shadow-lg"
        style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom label component for external labels with leader lines
  const renderExternalLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 50;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Leader line points
    const lineStartRadius = outerRadius + 5;
    const lineStartX = cx + lineStartRadius * Math.cos(-midAngle * RADIAN);
    const lineStartY = cy + lineStartRadius * Math.sin(-midAngle * RADIAN);
    
    const lineMidRadius = outerRadius + 35;
    const lineMidX = cx + lineMidRadius * Math.cos(-midAngle * RADIAN);
    const lineMidY = cy + lineMidRadius * Math.sin(-midAngle * RADIAN);

    return (
      <g>
        {/* Leader line */}
        <path
          d={`M${lineStartX},${lineStartY}L${lineMidX},${lineMidY}L${x},${y}`}
          stroke="rgba(255,255,255,0.6)"
          strokeWidth={2}
          fill="none"
        />
        {/* Label background */}
        <rect
          x={x - (x > cx ? 0 : 120)}
          y={y - 25}
          width={120}
          height={50}
          rx={8}
          fill="rgba(0,0,0,0.8)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1}
        />
        {/* Category name */}
        <text
          x={x - (x > cx ? -10 : 110)}
          y={y - 8}
          textAnchor={x > cx ? 'start' : 'end'}
          className="text-sm font-semibold fill-white"
        >
          {name}
        </text>
        {/* Amount */}
        <text
          x={x - (x > cx ? -10 : 110)}
          y={y + 12}
          textAnchor={x > cx ? 'start' : 'end'}
          className="text-xs font-medium fill-gray-300"
        >
          {formatCurrency(value)}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full">
      <div className="flex justify-center">
        {/* Enhanced Pie Chart */}
        <div className="w-full max-w-2xl h-[500px] sm:h-[600px] relative">
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
                label={renderPercentageLabel}
                outerRadius={140}
                innerRadius={40}
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
                      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
                    }}
                  />
                ))}
              </Pie>
              
              {/* External labels with leader lines */}
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderExternalLabel}
                outerRadius={140}
                innerRadius={40}
                fill="transparent"
                dataKey="value"
                stroke="none"
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center total display */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="bg-gray-900/90 rounded-full p-6 border-2 border-white/20 backdrop-blur-sm">
              <div className="text-xs text-gray-300 mb-1">Total Income</div>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {formatCurrency(monthlyIncome)}
              </div>
              {remaining > 0 && (
                <>
                  <div className="text-xs text-green-300 mt-2">Available</div>
                  <div className="text-sm font-semibold text-green-200">
                    {formatCurrency(remaining)}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Simplified budget summary */}
      {monthlyIncome > 0 && (
        <div className="mt-6 p-4 bg-linear-to-r from-purple-900/20 to-blue-900/20 border border-purple-700/30 rounded-xl">
          <div className="text-center">
            <span className="text-sm text-gray-300">Total Allocated: </span>
            <span className="text-lg font-semibold text-white">{formatCurrency(totalSpent)}</span>
            <span className="text-sm text-gray-400 ml-2">
              ({Math.round((totalSpent / monthlyIncome) * 100)}% of income)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
