// Quick test to check Supabase connection and database status
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');
console.log(`URL: ${supabaseUrl}`);
console.log(`Key: ${supabaseKey?.substring(0, 20)}...\n`);

const supabase = createClient(supabaseUrl, supabaseKey);

// Check if tables exist
async function checkDatabase() {
  try {
    console.log('Checking database tables...\n');

    const tables = ['feeds', 'folders', 'articles', 'user_feeds', 'user_articles'];
    const results = {};

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          if (error.code === '42P01') {
            results[table] = '❌ Table does not exist';
          } else {
            results[table] = `❌ Error: ${error.message}`;
          }
        } else {
          results[table] = '✅ Table exists';
        }
      } catch (e) {
        results[table] = `❌ Error: ${e.message}`;
      }
    }

    console.log('Database Status:');
    console.log('================');
    Object.entries(results).forEach(([table, status]) => {
      console.log(`${table}: ${status}`);
    });

    const allExist = Object.values(results).every(v => v.includes('✅'));

    console.log('\n' + '='.repeat(50));
    if (allExist) {
      console.log('✅ All tables exist! Database migration completed.');
      console.log('\nNext steps:');
      console.log('1. Deploy edge function: npm run supabase:deploy');
      console.log('2. Test locally: npm run dev');
      console.log('3. Deploy to platform');
    } else {
      console.log('❌ Some tables are missing. You need to run the migration.');
      console.log('\nTo run migration:');
      console.log('1. Go to: https://supabase.com/dashboard/project/xdbctgzeqvdnzbbharoj/sql/new');
      console.log('2. Copy contents of: supabase/migrations/001_initial_schema.sql');
      console.log('3. Paste and click "Run"');
    }
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.log('\nPlease check:');
    console.log('1. Your Supabase project is active');
    console.log('2. The anon key is correct');
    console.log('3. You have internet connection');
  }
}

checkDatabase();
