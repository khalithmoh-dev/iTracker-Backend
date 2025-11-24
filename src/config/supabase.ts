import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://vqjnfvpdrqpjlakefbly.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxam5mdnBkcnFwamxha2VmYmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MTc1NjEsImV4cCI6MjA3OTQ5MzU2MX0.GIf1EQwCVYdVZEdIc_7OD2_U3bDKvn4kGFh-v6_09w0';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase credentials not found. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};

