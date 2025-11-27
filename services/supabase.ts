
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
// 1. Project URL derived from your ID: ruvjgktheazdfhwptelp
const SUPABASE_URL = 'https://ruvjgktheazdfhwptelp.supabase.co';

// 2. PASTE YOUR ANON PUBLIC KEY HERE
// Go to Supabase > Settings > API > Project API Keys > anon / public
// DO NOT use the service_role (secret) key!
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1dmpna3RoZWF6ZGZod3B0ZWxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwODg4OTAsImV4cCI6MjA3OTY2NDg5MH0.WnvSt2VSyHCv1E8wI65ERlu7EO3WtzOJWwLkVbUIofg';

// Configure client with explicit session persistence in LocalStorage
export const supabase = 
  SUPABASE_ANON_KEY.includes('PASTE_YOUR') 
    ? null 
    : createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: window.localStorage
        }
    });

export const isSupabaseConfigured = () => !!supabase;
