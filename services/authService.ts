
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

/**
 * AUTHENTICATION SERVICE
 * Email Only OTP Flow
 */

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

export const requestOtp = async (email: string): Promise<AuthResponse> => {
  if (!supabase) return { success: false, message: 'Backend not connected.' };

  const cleanEmail = email.trim();

  // We define the redirect URL to current origin to prevent issues
  const redirectTo = window.location.origin;

  // Strictly use Email OTP
  const { error } = await supabase.auth.signInWithOtp({
    email: cleanEmail,
    options: {
      emailRedirectTo: redirectTo
    }
  });

  if (error) return { success: false, message: error.message };
  return { success: true, message: `Code sent to ${cleanEmail}` };
};

export const verifyOtp = async (email: string, code: string, name?: string): Promise<AuthResponse> => {
  if (!supabase) return { success: false, message: 'Backend not connected.' };

  const cleanEmail = email.trim();

  // Verify using 'email' type which covers Magic Link clicks (via App.tsx) and Manual Code entry
  const { data, error } = await supabase.auth.verifyOtp({
    email: cleanEmail,
    token: code,
    type: 'email'
  });

  if (error || !data.user) return { success: false, message: error?.message || 'Invalid Code' };

  // Sync Profile on registration
  if (name) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email: data.user.email,
      name: name,
      has_completed_onboarding: false // Explicitly mark as new user
    }, { onConflict: 'id' });
  }

  return { success: true, message: 'Authenticated', user: data.user };
};
