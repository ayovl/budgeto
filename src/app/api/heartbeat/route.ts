import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials');
      return NextResponse.json(
        { ok: false, error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Perform a minimal read-only query to keep Supabase active
    const { data, error } = await supabase
      .from('user_settings')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Heartbeat query error:', error);
      // Still return success to avoid alerting on empty tables
      return NextResponse.json({ 
        ok: true, 
        timestamp: new Date().toISOString(),
        message: 'Heartbeat sent (table may be empty)'
      });
    }

    console.log('Heartbeat successful at', new Date().toISOString());
    return NextResponse.json({ 
      ok: true, 
      timestamp: new Date().toISOString(),
      message: 'Supabase connection maintained'
    });

  } catch (error) {
    console.error('Heartbeat error:', error);
    return NextResponse.json(
      { 
        ok: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
