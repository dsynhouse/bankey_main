-- Premium Subscription System
-- Migration: Add tables for Razorpay subscription management

-- ==========================================
-- 1. Subscriptions Table
-- ==========================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  razorpay_subscription_id TEXT UNIQUE NOT NULL,
  razorpay_customer_id TEXT,
  plan_id TEXT NOT NULL DEFAULT 'premium_monthly',
  status TEXT NOT NULL CHECK (status IN ('created', 'active', 'paused', 'cancelled', 'expired')),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Foreign key constraint (references auth.users)
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ==========================================
-- 2. Payments Table
-- ==========================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  subscription_id UUID,
  razorpay_payment_id TEXT UNIQUE NOT NULL,
  razorpay_order_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL CHECK (status IN ('captured', 'failed', 'refunded', 'pending')),
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Foreign key constraints
  CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_payment_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
);

-- ==========================================
-- 3. Add Premium Fields to Profiles
-- ==========================================
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP;

-- ==========================================
-- 4. Row Level Security (RLS)
-- ==========================================

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Subscriptions: Users can only see their own
CREATE POLICY subscriptions_user_policy ON subscriptions
  FOR ALL 
  USING (auth.uid() = user_id);

-- Payments: Users can only read their own payments
CREATE POLICY payments_user_read_policy ON payments
  FOR SELECT 
  USING (auth.uid() = user_id);

-- ==========================================
-- 5. Indexes for Performance
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay_id ON subscriptions(razorpay_subscription_id);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE INDEX IF NOT EXISTS idx_profiles_premium ON profiles(is_premium);

-- ==========================================
-- 6. Helper Function: Check Premium Status
-- ==========================================

CREATE OR REPLACE FUNCTION is_user_premium(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT 
      COALESCE(
        (is_premium AND (premium_expires_at IS NULL OR premium_expires_at > NOW())),
        false
      )
    FROM profiles
    WHERE id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 7. Trigger: Auto-update subscriptions.updated_at
-- ==========================================

CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_subscription_timestamp
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

-- ==========================================
-- 8. Comments for Documentation
-- ==========================================

COMMENT ON TABLE subscriptions IS 'Stores Razorpay subscription data for premium users';
COMMENT ON TABLE payments IS 'Stores payment history for audit and billing';
COMMENT ON COLUMN profiles.is_premium IS 'Whether user has active premium subscription';
COMMENT ON COLUMN profiles.premium_expires_at IS 'When premium access expires (NULL = lifetime)';
