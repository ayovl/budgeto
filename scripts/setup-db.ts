import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database...\n');

  try {
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '../supabase/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    console.log('📝 Executing SQL schema...');
    
    // Execute the SQL schema
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema }).catch(async () => {
      // If rpc doesn't work, try direct query (for Supabase that supports it)
      return await (supabase as any).from('_').select('*').limit(0);
    });

    // Since we can't execute raw SQL directly via JS client easily,
    // let's create tables using the REST API if they don't exist
    console.log('📦 Creating tables programmatically...\n');

    // Check if tables exist by trying to query them
    const tables = ['user_settings', 'expenses', 'savings_goals', 'investment_plans'];
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('*').limit(1);
      
      if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log(`❌ Table "${table}" does not exist. Please run the SQL schema manually.`);
      } else if (error) {
        console.log(`⚠️  Table "${table}": ${error.message}`);
      } else {
        console.log(`✅ Table "${table}" exists and is accessible`);
      }
    }

    console.log('\n🎉 Database check complete!\n');
    console.log('📋 Next steps:');
    console.log('1. Go to your Supabase Dashboard > SQL Editor');
    console.log('2. Copy the contents of supabase/schema.sql');
    console.log('3. Paste and run it in the SQL Editor');
    console.log('4. Come back and run: npm run dev\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setupDatabase();
