'use client';

import React, { useState } from 'react';
import { InputField } from '../ui/InputField';
import { Button } from '../ui/Button';
import { BudgetAllocationChart } from './BudgetAllocationChart';
import { SectionContainer } from '../ui/SectionContainer';
import { DollarSign } from 'lucide-react';

interface MonthlyIncomeProps {
  income: number;
  onIncomeChange: (income: number) => void;
  needsPercentage: number;
  wantsPercentage: number;
  savingsPercentage: number;
}

export const MonthlyIncome: React.FC<MonthlyIncomeProps> = ({
  income,
  onIncomeChange,
  needsPercentage,
  wantsPercentage,
  savingsPercentage,
}) => {
  const [inputValue, setInputValue] = useState(income.toString());

  const handleIncomeUpdate = () => {
    const newIncome = parseFloat(inputValue) || 0;
    onIncomeChange(newIncome);
  };

  const needsAmount = (income * needsPercentage) / 100;
  const wantsAmount = (income * wantsPercentage) / 100;
  const savingsAmount = (income * savingsPercentage) / 100;

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
              prefix="$"
              placeholder="Enter your monthly income"
              min={0}
              step={100}
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
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-blue-600 font-medium mb-1">Needs ({needsPercentage}%)</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-700">${needsAmount.toFixed(2)}</p>
              </div>
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-orange-600 font-medium mb-1">Wants ({wantsPercentage}%)</p>
                <p className="text-lg sm:text-2xl font-bold text-orange-700">${wantsAmount.toFixed(2)}</p>
              </div>
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-green-600 font-medium mb-1">Savings ({savingsPercentage}%)</p>
                <p className="text-lg sm:text-2xl font-bold text-green-700">${savingsAmount.toFixed(2)}</p>
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
