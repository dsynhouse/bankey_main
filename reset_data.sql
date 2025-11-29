-- DANGER: This script wipes all user data!
-- Run this only when you want a fresh start for Beta testing.

-- 1. Truncate Data Tables (Cascades to related data if configured, but explicit is safer)
TRUNCATE TABLE public.transactions CASCADE;
TRUNCATE TABLE public.accounts CASCADE;
TRUNCATE TABLE public.budgets CASCADE;
TRUNCATE TABLE public.goals CASCADE;

-- 2. Reset User Profiles (Keep the accounts, but reset progress)
UPDATE public.profiles
SET 
    xp = 0,
    total_xp = 0,
    level = 1,
    streak_days = 0,
    inventory = '{}',
    completed_unit_ids = '{}',
    has_completed_onboarding = false, -- Force onboarding again
    last_bonus_date = null;

-- 3. Verify
SELECT count(*) as transactions_remaining FROM public.transactions;
