'use client';

import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, DollarSign } from 'lucide-react';
import { SectionContainer } from '../ui/SectionContainer';
import { InputField } from '../ui/InputField';
import { Button } from '../ui/Button';
import { InvestmentPlan } from '@/lib/supabase/types';
import { formatCurrency } from '@/lib/utils/currency';

interface InvestmentPlansProps {
  plans: InvestmentPlan[];
  onAddPlan: (plan: Omit<InvestmentPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  onEditPlan: (id: string, plan: Omit<InvestmentPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  onDeletePlan: (id: string) => void;
}

export const InvestmentPlans: React.FC<InvestmentPlansProps> = ({
  plans,
  onAddPlan,
  onEditPlan,
  onDeletePlan,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [planName, setPlanName] = useState('');
  const [monthlyInvestment, setMonthlyInvestment] = useState('');
  const [durationMonths, setDurationMonths] = useState('');
  const [returnRate, setReturnRate] = useState('7.0'); // Default 7% annual return
  const [totalReturn, setTotalReturn] = useState('0');

  // Calculate total return whenever inputs change
  useEffect(() => {
    const monthly = parseFloat(monthlyInvestment);
    const months = parseInt(durationMonths);
    const rate = parseFloat(returnRate) / 100 / 12; // Convert annual rate to monthly

    if (isNaN(monthly) || isNaN(months) || isNaN(rate) || monthly <= 0 || months <= 0) {
      setTotalReturn('0');
      return;
    }

    // Calculate future value with compound interest
    // FV = P * [((1 + r)^n - 1) / r]
    const futureValue = monthly * (Math.pow(1 + rate, months) - 1) / rate;
    setTotalReturn(Math.round(futureValue).toString());
  }, [monthlyInvestment, durationMonths, returnRate]);

  const handleSave = () => {
    if (!planName.trim() || !monthlyInvestment || !durationMonths) return;

    const planData = {
      name: planName.trim(),
      monthly_investment: parseFloat(monthlyInvestment),
      duration_months: parseInt(durationMonths),
      estimated_return_rate: parseFloat(returnRate),
      total_return: parseFloat(totalReturn),
    };

    if (editingId) {
      onEditPlan(editingId, planData);
    } else {
      onAddPlan(planData);
    }

    resetForm();
  };

  const handleEdit = (id: string) => {
    const plan = plans.find((p) => p.id === id);
    if (plan) {
      setPlanName(plan.name);
      setMonthlyInvestment(plan.monthly_investment.toString());
      setDurationMonths(plan.duration_months.toString());
      setReturnRate(plan.estimated_return_rate.toString());
      setEditingId(id);
      setIsAdding(true);
    }
  };

  const resetForm = () => {
    setPlanName('');
    setMonthlyInvestment('');
    setDurationMonths('');
    setReturnRate('7.0');
    setTotalReturn('0');
    setEditingId(null);
    setIsAdding(false);
  };

  const formatDuration = (months: number): string => {
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''}`;
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (remainingMonths === 0) return `${years} year${years !== 1 ? 's' : ''}`;
    return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  };

  const calculateTotalInvested = (monthly: number, months: number): number => {
    return Math.round(monthly * months);
  };

  return (
    <SectionContainer title="Investment Plans" color="purple">
      <div className="space-y-4">
        {isAdding && (
          <div className="bg-white p-4 rounded-lg border-2 border-gray-300 space-y-3">
            <InputField
              label="Investment Plan Name"
              value={planName}
              onChange={setPlanName}
              type="text"
              placeholder="e.g., Retirement Fund, Stock Portfolio"
              onEnter={handleSave}
            />

            <InputField
              label="Monthly Investment"
              value={monthlyInvestment}
              onChange={setMonthlyInvestment}
              type="number"
              prefix="₨"
              min={0}
              step={50}
              onEnter={handleSave}
            />

            <InputField
              label="Duration (months)"
              value={durationMonths}
              onChange={setDurationMonths}
              type="number"
              min={1}
              step={1}
              onEnter={handleSave}
            />

            <InputField
              label="Expected Annual Return Rate (%)"
              value={returnRate}
              onChange={setReturnRate}
              type="number"
              min={0}
              max={100}
              step={0.1}
              onEnter={handleSave}
            />

            {totalReturn !== '0' && (
              <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                <p className="text-sm text-purple-600 font-medium mb-2">Projected Returns</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Invested:</span>
                    <span className="font-bold">
                      {formatCurrency(calculateTotalInvested(parseFloat(monthlyInvestment) || 0, parseInt(durationMonths) || 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Return:</span>
                    <span className="font-bold text-purple-700 text-xl">{formatCurrency(parseFloat(totalReturn))}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Profit:</span>
                    <span className="font-bold">
                      {formatCurrency(parseFloat(totalReturn) - calculateTotalInvested(parseFloat(monthlyInvestment) || 0, parseInt(durationMonths) || 0))}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSave} variant="primary" size="sm" className="flex-1">
                {editingId ? 'Update Plan' : 'Add Plan'}
              </Button>
              <Button onClick={resetForm} variant="secondary" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            variant="secondary"
            className="w-full flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Investment Plan
          </Button>
        )}

        <div className="space-y-3">
          {plans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No investment plans yet. Create one to start building wealth!</p>
            </div>
          ) : (
            plans.map((plan) => (
              <div key={plan.id} className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-purple-800">{plan.name}</h3>
                    <p className="text-sm text-purple-600">{formatDuration(plan.duration_months)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(plan.id)}
                      className="p-2 hover:bg-purple-200 rounded-lg transition-colors"
                      aria-label="Edit plan"
                    >
                      <DollarSign className="w-4 h-4 text-purple-700" />
                    </button>
                    <button
                      onClick={() => onDeletePlan(plan.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                      aria-label="Delete plan"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-gray-600">Monthly Investment</p>
                    <p className="font-bold text-purple-700">{formatCurrency(plan.monthly_investment)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Return Rate</p>
                    <p className="font-bold text-purple-700">{plan.estimated_return_rate.toFixed(1)}% / year</p>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-purple-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-600">Total Invested</p>
                      <p className="font-semibold">{formatCurrency(calculateTotalInvested(plan.monthly_investment, plan.duration_months))}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Estimated Return</p>
                      <p className="font-bold text-lg text-purple-700">{formatCurrency(plan.total_return)}</p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-purple-100">
                    <div className="flex justify-between">
                      <span className="text-xs text-green-600">Projected Profit:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(plan.total_return - calculateTotalInvested(plan.monthly_investment, plan.duration_months))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </SectionContainer>
  );
};
