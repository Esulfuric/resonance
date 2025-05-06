
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize supabase client (with proper type checking)
let supabaseClient;

// Check if variables are defined
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing. Make sure you have connected to Supabase through the Lovable integration.');
  
  // Provide fallback values for development to prevent app from crashing
  const fallbackUrl = 'https://your-project.supabase.co';
  const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvbWVwcm9qZWN0IiwicmF0IjoxNzE2OTMyNzI1LCJpYXQiOjE3MTY5MzI3MjUsImV4cCI6MTcxNzUzNzUyNX0.fallback';
  
  // Create a mock client with fallback values
  supabaseClient = createClient(fallbackUrl, fallbackKey);
} else {
  // Create a real client with actual credentials
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

// Export the supabase client
export const supabase = supabaseClient;
