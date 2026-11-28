import { createClient } from '@supabase/supabase-js';

// "same-origin" (what the VPS uses) means the API lives on whatever address serves the app,
// so the site works under any domain, and moving it doesn't need a rebuild.
const configuredUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseUrl = configuredUrl === 'same-origin' ? window.location.origin : configuredUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
