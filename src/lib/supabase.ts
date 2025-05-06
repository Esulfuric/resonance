
import { createClient } from '@supabase/supabase-js';

// Import the values from the client file to ensure consistency
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Export the configured supabase client
export const supabase = supabaseClient;
