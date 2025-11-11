import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = localStorage.getItem('SUPABASE_URL') || '';
const SUPABASE_KEY = localStorage.getItem('SUPABASE_KEY') || '';

// Only create client if both URL and key are provided
let supabase: ReturnType<typeof createClient<Database>> | null = null;

if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    // Ensure the URL is properly formatted
    const formattedUrl = SUPABASE_URL.trim().replace(/^https?:\/\//, '');
    supabase = createClient<Database>(
      `https://${formattedUrl}`,
      SUPABASE_KEY,
      {
        auth: {
          storage: localStorage,
          persistSession: true,
          autoRefreshToken: true,
        }
      }
    );
  } catch (error) {
    console.error('Error creating Supabase client:', error);
  }
}

export { supabase };