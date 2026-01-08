
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
// Project URL: nauoinujfduhsahdbdbp
const SUPABASE_URL = 'https://nauoinujfduhsahdbdbp.supabase.co';

// ANON PUBLIC KEY - for client-side authentication
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hdW9pbnVqZmR1aHNhaGRiZGJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NjQ1NjAsImV4cCI6MjA4MzQ0MDU2MH0.OMttgtCFJDZO98p020eF0mOQEbz3EjjM0PSSkP0PN_M';

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
