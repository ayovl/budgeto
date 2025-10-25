export interface UserSettings {
  id: string;
  user_id: string;
  monthly_income: number;
  needs_percentage: number;
  wants_percentage: number;
  savings_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category: 'needs' | 'wants' | 'savings';
  name: string;
  amount: number;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  type: 'short-term' | 'medium-term' | 'long-term';
  target_amount: number;
  current_saved: number;
  start_date: string;
  target_date: string;
  monthly_savings: number;
  created_at: string;
  updated_at: string;
}

export interface InvestmentPlan {
  id: string;
  user_id: string;
  name: string;
  monthly_investment: number;
  duration_months: number;
  estimated_return_rate: number;
  total_return: number;
  created_at: string;
  updated_at: string;
}
