
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

/**
 * AUTHENTICATION SERVICE
 * Email Only OTP Flow
 * 
 * DEV MODE: Use dev@bankey.test with OTP 123456 for testing
 */

// Development test account constants
const DEV_TEST_EMAIL = 'dev@bankey.test';
const DEV_TEST_OTP = '123456';
const isDev = import.meta.env?.DEV || false;

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

export const requestOtp = async (email: string): Promise<AuthResponse> => {
  const cleanEmail = email.trim().toLowerCase();

  // DEV MODE: Skip OTP for test account
  if (isDev && cleanEmail === DEV_TEST_EMAIL) {
    console.log('🔧 DEV MODE: Test account detected, skipping OTP request');
    return { success: true, message: `DEV MODE: Use code ${DEV_TEST_OTP}` };
  }

  if (!supabase) return { success: false, message: 'Backend not connected.' };

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
  const cleanEmail = email.trim().toLowerCase();

  // DEV MODE: Bypass verification for test account
  if (isDev && cleanEmail === DEV_TEST_EMAIL && code === DEV_TEST_OTP) {
    console.log('🔧 DEV MODE: Test account verified with static OTP');
    // Create a mock user object for dev purposes
    const mockUser: User = {
      id: 'dev-test-user-id-123',
      email: DEV_TEST_EMAIL,
      app_metadata: {},
      user_metadata: { name: name || 'Dev Tester' },
      aud: 'authenticated',
      created_at: new Date().toISOString()
    };
    return { success: true, message: 'DEV MODE: Authenticated', user: mockUser };
  }

  if (!supabase) return { success: false, message: 'Backend not connected.' };

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
