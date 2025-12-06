#!/bin/bash

# Razorpay Premium Subscription Setup Script
# Run this script to configure your environment for Razorpay test mode

echo "🔧 Setting up Razorpay Test Environment..."

# Create .env.local file
cat > .env.local << 'EOF'
# Razorpay Test Mode Credentials (Frontend - Public Key)
VITE_RAZORPAY_KEY_ID=rzp_test_RnWAegQw5AA6V8
EOF

echo "✅ Created .env.local with Razorpay test key"

echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Create Subscription Plan in Razorpay:"
echo "   - Go to: https://dashboard.razorpay.com/app/subscriptions/plans"
echo "   - Make sure you're in TEST MODE (blue banner at top)"
echo "   - Click 'Create New Plan'"
echo "   - Fill in:"
echo "     * Plan Name: Bankey Premium Monthly"
echo "     * Billing Cycle: Monthly (every 1 month)"
echo "     * Amount: 149.00 INR"
echo "     * Trial Period: 7 days (optional)"
echo "   - Click 'Create Plan'"
echo "   - COPY THE PLAN ID (looks like: plan_xxxxxxxxxxxxx)"
echo ""
echo "2. Configure Supabase Edge Function Secrets:"
echo "   - Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/vault"
echo "   - Add these secrets:"
echo "     * RAZORPAY_KEY_ID = rzp_test_RnWAegQw5AA6V8"
echo "     * RAZORPAY_SECRET = 37HYUlKJUXWQrm378Ccuv35S"
echo "     * RAZORPAY_WEBHOOK_SECRET = (generate in Razorpay webhook settings)"
echo ""
echo "3. Run Database Migration:"
echo "   - Go to Supabase Dashboard → SQL Editor"
echo "   - Copy/paste: supabase_migrations/001_add_premium_subscriptions.sql"
echo "   - Click 'Run'"
echo ""
echo "✨ After completing these steps, tell the AI your Plan ID!"
