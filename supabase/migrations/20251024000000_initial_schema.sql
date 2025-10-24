-- Budget Planner Database Schema

-- Enable UUID extension (use gen_random_uuid() which is built-in to Postgres)
-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  monthly_income DECIMAL(12, 2) NOT NULL DEFAULT 0,
  needs_percentage INTEGER NOT NULL DEFAULT 50,
  wants_percentage INTEGER NOT NULL DEFAULT 30,
  savings_percentage INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('needs', 'wants', 'savings')),
  name TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Savings Goals Table
CREATE TABLE IF NOT EXISTS savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('short-term', 'medium-term', 'long-term')),
  target_amount DECIMAL(12, 2) NOT NULL,
  start_date DATE NOT NULL,
  target_date DATE NOT NULL,
  monthly_savings DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Investment Plans Table
CREATE TABLE IF NOT EXISTS investment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  monthly_investment DECIMAL(12, 2) NOT NULL,
  duration_months INTEGER NOT NULL,
  estimated_return_rate DECIMAL(5, 2) NOT NULL DEFAULT 7.0,
  total_return DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_investment_plans_user_id ON investment_plans(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savings_goals_updated_at BEFORE UPDATE ON savings_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investment_plans_updated_at BEFORE UPDATE ON investment_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_plans ENABLE ROW LEVEL SECURITY;

-- For simplicity with local development, we'll use user_id based policies
-- In production, you'd use auth.uid() with Supabase authentication

-- User Settings Policies
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (true);

-- Expenses Policies
CREATE POLICY "Users can view their own expenses" ON expenses
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own expenses" ON expenses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own expenses" ON expenses
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own expenses" ON expenses
  FOR DELETE USING (true);

-- Savings Goals Policies
CREATE POLICY "Users can view their own goals" ON savings_goals
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own goals" ON savings_goals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own goals" ON savings_goals
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own goals" ON savings_goals
  FOR DELETE USING (true);

-- Investment Plans Policies
CREATE POLICY "Users can view their own plans" ON investment_plans
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own plans" ON investment_plans
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own plans" ON investment_plans
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own plans" ON investment_plans
  FOR DELETE USING (true);
