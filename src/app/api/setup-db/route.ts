import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if tables exist
    const tables = ['user_settings', 'expenses', 'savings_goals', 'investment_plans'];
    const results: any = {};

    for (const table of tables) {
      const { error } = await supabase.from(table).select('id').limit(1);
      
      if (error) {
        results[table] = {
          exists: false,
          error: error.message
        };
      } else {
        results[table] = {
          exists: true,
          message: 'Table exists and is accessible'
        };
      }
    }

    const allTablesExist = Object.values(results).every((r: any) => r.exists);

    if (!allTablesExist) {
      // Create tables if they don't exist
      try {
        // Enable UUID extension
        await supabase.rpc('exec_sql', { 
          sql: 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";' 
        });

        // Create user_settings table
        await supabase.rpc('exec_sql', { 
          sql: `
            CREATE TABLE IF NOT EXISTS user_settings (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_id TEXT NOT NULL UNIQUE,
              monthly_income DECIMAL(12, 2) NOT NULL DEFAULT 0,
              needs_percentage INTEGER NOT NULL DEFAULT 50,
              wants_percentage INTEGER NOT NULL DEFAULT 30,
              savings_percentage INTEGER NOT NULL DEFAULT 20,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
            );
          `
        });

        // Create expenses table
        await supabase.rpc('exec_sql', { 
          sql: `
            CREATE TABLE IF NOT EXISTS expenses (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_id TEXT NOT NULL,
              category TEXT NOT NULL CHECK (category IN ('needs', 'wants', 'savings')),
              name TEXT NOT NULL,
              amount DECIMAL(12, 2) NOT NULL,
              date DATE NOT NULL DEFAULT CURRENT_DATE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
            );
          `
        });

        // Create savings_goals table
        await supabase.rpc('exec_sql', { 
          sql: `
            CREATE TABLE IF NOT EXISTS savings_goals (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
          `
        });

        // Create investment_plans table
        await supabase.rpc('exec_sql', { 
          sql: `
            CREATE TABLE IF NOT EXISTS investment_plans (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_id TEXT NOT NULL,
              name TEXT NOT NULL,
              monthly_investment DECIMAL(12, 2) NOT NULL,
              duration_months INTEGER NOT NULL,
              estimated_return_rate DECIMAL(5, 2) NOT NULL DEFAULT 7.0,
              total_return DECIMAL(12, 2) NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
            );
          `
        });

        // Create indexes
        await supabase.rpc('exec_sql', { sql: 'CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);' });
        await supabase.rpc('exec_sql', { sql: 'CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);' });
        await supabase.rpc('exec_sql', { sql: 'CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);' });
        await supabase.rpc('exec_sql', { sql: 'CREATE INDEX IF NOT EXISTS idx_investment_plans_user_id ON investment_plans(user_id);' });

        // Enable RLS
        await supabase.rpc('exec_sql', { sql: 'ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;' });
        await supabase.rpc('exec_sql', { sql: 'ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;' });
        await supabase.rpc('exec_sql', { sql: 'ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;' });
        await supabase.rpc('exec_sql', { sql: 'ALTER TABLE investment_plans ENABLE ROW LEVEL SECURITY;' });

        // Create policies (allow all for development)
        await supabase.rpc('exec_sql', { sql: 'CREATE POLICY "Allow all operations on user_settings" ON user_settings FOR ALL USING (true) WITH CHECK (true);' });
        await supabase.rpc('exec_sql', { sql: 'CREATE POLICY "Allow all operations on expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);' });
        await supabase.rpc('exec_sql', { sql: 'CREATE POLICY "Allow all operations on savings_goals" ON savings_goals FOR ALL USING (true) WITH CHECK (true);' });
        await supabase.rpc('exec_sql', { sql: 'CREATE POLICY "Allow all operations on investment_plans" ON investment_plans FOR ALL USING (true) WITH CHECK (true);' });

        return NextResponse.json({
          success: true,
          message: 'Database tables created successfully! 🎉',
          action: 'Tables were created automatically'
        });

      } catch (createError) {
        return NextResponse.json({
          success: false,
          message: 'Failed to create tables automatically. Please create them manually.',
          instructions: [
            '1. Go to Supabase Dashboard > SQL Editor',
            '2. Copy contents from supabase/schema.sql',
            '3. Paste and run it'
          ],
          error: createError instanceof Error ? createError.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'All database tables are set up correctly! 🎉',
      tables: results
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Database check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
