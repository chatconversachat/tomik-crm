import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = localStorage.getItem('SUPABASE_URL') || '';
const SUPABASE_KEY = localStorage.getItem('SUPABASE_KEY') || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase configuration. Please configure it in the application settings.');
}

// Ensure the URL is properly formatted
const formattedUrl = SUPABASE_URL.trim().replace(/^https?:\/\//, '');
export const supabase = createClient<Database>(
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