import { useState, useEffect } from 'react';
import { supabase } from './client';
import { UserSettings, Expense, SavingsGoal, InvestmentPlan } from './types';

const USER_ID = 'default-user'; // For local development without auth

// User Settings Hooks
export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', USER_ID)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings(data);
      } else {
        // Create default settings
        const defaultSettings: Omit<UserSettings, 'id' | 'created_at' | 'updated_at'> = {
          user_id: USER_ID,
          monthly_income: 0,
          needs_percentage: 50,
          wants_percentage: 30,
          savings_percentage: 20,
        };
        await createSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSettings = async (newSettings: Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('user_settings')
      .insert([newSettings])
      .select()
      .single();

    if (error) throw error;
    setSettings(data);
    return data;
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    const { data, error } = await supabase
      .from('user_settings')
      .update(updates)
      .eq('user_id', USER_ID)
      .select()
      .single();

    if (error) throw error;
    setSettings(data);
    return data;
  };

  return { settings, loading, updateSettings, refetch: fetchSettings };
};

// Expenses Hooks
export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', USER_ID)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('expenses')
      .insert([{ ...expense, user_id: USER_ID }])
      .select()
      .single();

    if (error) throw error;
    setExpenses((prev) => [data, ...prev]);
    return data;
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    setExpenses((prev) => prev.map((exp) => (exp.id === id ? data : exp)));
    return data;
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  return { expenses, loading, addExpense, updateExpense, deleteExpense, refetch: fetchExpenses };
};

// Savings Goals Hooks
export const useSavingsGoals = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', USER_ID)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async (goal: Omit<SavingsGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('savings_goals')
      .insert([{ ...goal, user_id: USER_ID }])
      .select()
      .single();

    if (error) throw error;
    setGoals((prev) => [data, ...prev]);
    return data;
  };

  const updateGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    const { data, error } = await supabase
      .from('savings_goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    setGoals((prev) => prev.map((goal) => (goal.id === id ? data : goal)));
    return data;
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  };

  return { goals, loading, addGoal, updateGoal, deleteGoal, refetch: fetchGoals };
};

// Investment Plans Hooks
export const useInvestmentPlans = () => {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('investment_plans')
        .select('*')
        .eq('user_id', USER_ID)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPlan = async (plan: Omit<InvestmentPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('investment_plans')
      .insert([{ ...plan, user_id: USER_ID }])
      .select()
      .single();

    if (error) throw error;
    setPlans((prev) => [data, ...prev]);
    return data;
  };

  const updatePlan = async (id: string, updates: Partial<InvestmentPlan>) => {
    const { data, error } = await supabase
      .from('investment_plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    setPlans((prev) => prev.map((plan) => (plan.id === id ? data : plan)));
    return data;
  };

  const deletePlan = async (id: string) => {
    const { error } = await supabase
      .from('investment_plans')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setPlans((prev) => prev.filter((plan) => plan.id !== id));
  };

  return { plans, loading, addPlan, updatePlan, deletePlan, refetch: fetchPlans };
};
