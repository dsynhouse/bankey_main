-- Add missing columns to profiles table
-- Run this in Supabase SQL Editor

-- Add missing columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS completed_unit_ids TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_bonus_date TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'USD';

-- Copy existing xp to total_xp if needed
UPDATE profiles SET total_xp = xp WHERE total_xp IS NULL OR total_xp = 0;

-- Optional: You can drop the old 'xp' column if you want (be careful!)
-- ALTER TABLE profiles DROP COLUMN IF EXISTS xp;
