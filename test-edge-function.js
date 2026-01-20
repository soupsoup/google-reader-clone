// Test edge function to see what error we're getting
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🧪 Testing Edge Function Call\n');

const supabase = createClient(supabaseUrl, supabaseKey);

// First, sign in to get a valid session
async function testEdgeFunction() {
  try {
    console.log('Step 1: Creating test user session...');

    // Try to sign in (you'll need to use your actual test credentials)
    const testEmail = 'test@example.com';
    const testPassword = 'testpassword123';

    console.log(`Attempting to sign in as: ${testEmail}`);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (authError) {
      console.log('❌ Auth Error:', authError.message);
      console.log('\nNote: Update testEmail and testPassword in test-edge-function.js');
      console.log('Or create a test user in Supabase dashboard and confirm their email.\n');
      return;
    }

    console.log('✅ Signed in successfully');
    console.log('User ID:', authData.user.id);
    console.log('Session token:', authData.session.access_token.substring(0, 20) + '...\n');

    console.log('Step 2: Calling edge function...');

    const { data, error } = await supabase.functions.invoke('fetch-feeds', {
      body: {
        feed_url: 'https://hnrss.org/frontpage',
        user_id: authData.user.id
      },
      headers: {
        Authorization: `Bearer ${authData.session.access_token}`,
      },
    });

    if (error) {
      console.log('❌ Edge Function Error:');
      console.log('Status:', error.status);
      console.log('Message:', error.message);
      console.log('Context:', error.context);
      console.log('\nFull error object:');
      console.log(JSON.stringify(error, null, 2));
      return;
    }

    console.log('✅ Edge function called successfully!');
    console.log('Response:', data);

  } catch (err) {
    console.log('❌ Unexpected Error:', err.message);
    console.log(err);
  }
}

testEdgeFunction();
