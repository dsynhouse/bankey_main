-- ============================================
-- BANKEY COMPLETE DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. PROFILES TABLE (Base user profile)
-- ==========================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 1,
  completed_unit_ids TEXT[] DEFAULT '{}',
  inventory TEXT[] DEFAULT '{}',
  has_completed_onboarding BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  premium_expires_at TIMESTAMP,
  last_bonus_date TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- 2. ACCOUNTS TABLE (Wallets)
-- ==========================================
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Main Wallet',
  type TEXT NOT NULL DEFAULT 'spending',
  balance DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  color TEXT DEFAULT 'bg-banky-pink',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- 3. TRANSACTIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  date TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- 4. BUDGETS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  limit_amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- ==========================================
-- 5. GOALS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  saved_amount DECIMAL(12,2) DEFAULT 0,
  deadline DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- 6. SUBSCRIPTIONS TABLE (Premium)
-- ==========================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  razorpay_subscription_id TEXT UNIQUE NOT NULL,
  razorpay_customer_id TEXT,
  plan_id TEXT NOT NULL DEFAULT 'premium_monthly',
  status TEXT NOT NULL CHECK (status IN ('created', 'active', 'paused', 'cancelled', 'expired')),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- 7. PAYMENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  razorpay_payment_id TEXT UNIQUE NOT NULL,
  razorpay_order_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL CHECK (status IN ('captured', 'failed', 'refunded', 'pending')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- 8. BILL SPLITTER TABLES
-- ==========================================
CREATE TABLE IF NOT EXISTS split_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS split_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES split_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  balance DECIMAL(12,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS split_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES split_groups(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  paid_by_id UUID REFERENCES split_members(id) ON DELETE SET NULL,
  split_between UUID[] DEFAULT '{}',
  date TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_expenses ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/write their own profile
CREATE POLICY profiles_policy ON profiles FOR ALL USING (auth.uid() = id);

-- Accounts: Users can manage their own accounts
CREATE POLICY accounts_policy ON accounts FOR ALL USING (auth.uid() = user_id);

-- Transactions: Users can manage their own transactions
CREATE POLICY transactions_policy ON transactions FOR ALL USING (auth.uid() = user_id);

-- Budgets: Users can manage their own budgets
CREATE POLICY budgets_policy ON budgets FOR ALL USING (auth.uid() = user_id);

-- Goals: Users can manage their own goals
CREATE POLICY goals_policy ON goals FOR ALL USING (auth.uid() = user_id);

-- Subscriptions: Users can view their own subscriptions
CREATE POLICY subscriptions_policy ON subscriptions FOR ALL USING (auth.uid() = user_id);

-- Payments: Users can view their own payments
CREATE POLICY payments_policy ON payments FOR SELECT USING (auth.uid() = user_id);

-- Split Groups: Users can manage their own groups
CREATE POLICY split_groups_policy ON split_groups FOR ALL USING (auth.uid() = user_id);

-- Split Members: Users can manage members in their groups
CREATE POLICY split_members_policy ON split_members FOR ALL 
  USING (group_id IN (SELECT id FROM split_groups WHERE user_id = auth.uid()));

-- Split Expenses: Users can manage expenses in their groups
CREATE POLICY split_expenses_policy ON split_expenses FOR ALL 
  USING (group_id IN (SELECT id FROM split_groups WHERE user_id = auth.uid()));

-- ==========================================
-- 10. INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_premium ON profiles(is_premium);
CREATE INDEX IF NOT EXISTS idx_split_groups_user_id ON split_groups(user_id);

-- ==========================================
-- 11. REALTIME SUBSCRIPTIONS
-- ==========================================
-- Enable realtime for these tables (run in Supabase dashboard if needed)
-- ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
-- ALTER PUBLICATION supabase_realtime ADD TABLE accounts;
-- ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
-- ALTER PUBLICATION supabase_realtime ADD TABLE budgets;
-- ALTER PUBLICATION supabase_realtime ADD TABLE goals;

-- ==========================================
-- DONE! Your database is ready.
-- ==========================================
