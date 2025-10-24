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

    if (allTablesExist) {
      return NextResponse.json({
        success: true,
        message: 'All database tables are set up correctly! 🎉',
        tables: results
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Some tables are missing. Please run the SQL schema.',
        instructions: [
          '1. Go to Supabase Dashboard > SQL Editor',
          '2. Copy contents from supabase/schema.sql',
          '3. Paste and run it',
          '4. Refresh this page'
        ],
        tables: results
      });
    }

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
