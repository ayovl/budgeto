'use client';

import React, { useState } from 'react';
import { InputField } from '../ui/InputField';
import { Button } from '../ui/Button';
import { BudgetAllocationChart } from './BudgetAllocationChart';
import { SectionContainer } from '../ui/SectionContainer';
import { DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';

interface MonthlyIncomeProps {
  income: number;
  onIncomeChange: (income: number) => void;
  needsPercentage: number;
  wantsPercentage: number;
  savingsPercentage: number;
  needsTotal: number;
  wantsTotal: number;
  savingsTotal: number;
}

export const MonthlyIncome: React.FC<MonthlyIncomeProps> = ({
  income,
  onIncomeChange,
  needsPercentage,
  wantsPercentage,
  savingsPercentage,
  needsTotal,
  wantsTotal,
  savingsTotal,
}) => {
  const [inputValue, setInputValue] = useState(income.toString());
  const [lastIncome, setLastIncome] = useState(income);

  React.useEffect(() => {
    // Only update input if the income prop changed from external source
    if (income !== lastIncome) {
      setInputValue(income.toString());
      setLastIncome(income);
    }
  }, [income, lastIncome]);

  const handleIncomeUpdate = async () => {
    const newIncome = parseFloat(inputValue) || 0;
    setLastIncome(newIncome);
    await onIncomeChange(newIncome);
  };

  // Use actual expense totals instead of calculated percentages
  const needsAmount = needsTotal;
  const wantsAmount = wantsTotal;
  const savingsAmount = savingsTotal;

  return (
    <SectionContainer title="Monthly Budget Overview" color="purple">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <InputField
              label="Monthly Income"
              value={inputValue}
              onChange={setInputValue}
              type="number"
              prefix="₨"
              placeholder="Enter your monthly income"
              min={0}
              step={100}
              onEnter={handleIncomeUpdate}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleIncomeUpdate} className="w-full sm:w-auto">
              Update Budget
            </Button>
          </div>
        </div>

        {income > 0 && (
          <>
            <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-2 mb-2">
              <p className="text-xs text-purple-300 text-center">
                💡 Recommended: 50% Needs • 30% Wants • 20% Savings
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="bg-blue-900/40 border-2 border-blue-700/40 rounded-xl p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-blue-300 font-medium mb-1">Needs ({needsPercentage}%)</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-200">{formatCurrency(needsAmount)}</p>
              </div>
              <div className="bg-orange-900/40 border-2 border-orange-700/40 rounded-xl p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-orange-300 font-medium mb-1">Wants ({wantsPercentage}%)</p>
                <p className="text-lg sm:text-2xl font-bold text-orange-200">{formatCurrency(wantsAmount)}</p>
              </div>
              <div className="bg-green-900/40 border-2 border-green-700/40 rounded-xl p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-green-300 font-medium mb-1">Savings ({savingsPercentage}%)</p>
                <p className="text-lg sm:text-2xl font-bold text-green-200">{formatCurrency(savingsAmount)}</p>
              </div>
            </div>

            <BudgetAllocationChart
              needs={needsAmount}
              wants={wantsAmount}
              savings={savingsAmount}
            />
          </>
        )}

        {income === 0 && (
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Enter your monthly income to see your budget allocation</p>
          </div>
        )}
      </div>
    </SectionContainer>
  );
};
