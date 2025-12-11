import React, { useState, useEffect, useCallback } from 'react';
import { useBanky } from '../context/useBanky';
import { usePremium } from '../context/usePremium';
import {
    initiateSubscription,
    cancelSubscription,
    getUserSubscription,
    getPaymentHistory
} from '../services/razorpayService';
import { PremiumBadge, ComingSoonBadge } from './PremiumBadge';
import {
    Sparkles,
    CreditCard,
    AlertCircle,
    ScanText,
    Mic,
    Landmark,
    Bot
} from 'lucide-react';
import type { Subscription, Payment, PremiumFeature } from '../types';

const PREMIUM_FEATURES: PremiumFeature[] = [
    {
        id: 'ocr',
        name: 'OCR Bill Scanning',
        description: 'Snap photos of receipts and bills - auto-log expenses instantly',
        icon: <ScanText className="w-8 h-8 text-banky-blue" />,
        available: true // OCR scanning now implemented!
    },
    {
        id: 'voice',
        name: 'Voice Commands',
        description: 'Just speak your expenses - "I spent ₹500 on groceries"',
        icon: <Mic className="w-8 h-8 text-banky-pink" />,
        available: true // Voice commands now implemented!
    },
    {
        id: 'bank-sync',
        name: 'Bank Auto-Sync',
        description: 'Connect your bank account - zero manual logging',
        icon: <Landmark className="w-8 h-8 text-green-600" />,
        available: false
    },
    {
        id: 'premium-ai',
        name: 'Premium Advisor AI',
        description: 'Unlimited deep financial analysis and personalized strategies',
        icon: <Bot className="w-8 h-8 text-purple-600" />,
        available: true
    }
];

export const PremiumSettings: React.FC = () => {
    const { user } = useBanky();
    const { isPremium, expiresAt, daysRemaining } = usePremium();

    const [loading, setLoading] = useState(false);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [showPayments, setShowPayments] = useState(false);

    const loadSubscriptionData = useCallback(async () => {
        if (!user) return;

        const [subData, paymentData] = await Promise.all([
            getUserSubscription(user.id),
            getPaymentHistory(user.id)
        ]);

        setSubscription(subData);
        setPayments(paymentData);
    }, [user]);

    useEffect(() => {
        if (user && isPremium) {
            loadSubscriptionData();
        }
    }, [user, isPremium, loadSubscriptionData]);

    const handleSubscribe = async () => {
        if (!user) return;

        setLoading(true);
        try {
            await initiateSubscription(user.id, {
                name: user.name,
                email: user.email
            });
        } catch (error) {
            console.error('Subscription error:', error);
            alert('Failed to start subscription. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        // Access snake_case field from Supabase (database returns snake_case, not camelCase)
        const subscriptionId = (subscription as unknown as Record<string, unknown>)?.razorpay_subscription_id as string || subscription?.razorpaySubscriptionId;


        if (!subscriptionId) {
            alert('Error: Could not find Subscription ID. Please verify you have an active subscription.');
            return;
        }

        const confirmed = window.confirm(
            'Are you sure you want to cancel? You\'ll retain premium access until the end of your billing period.'
        );

        if (!confirmed) return;

        setLoading(true);
        try {
            await cancelSubscription(subscriptionId);
        } catch (error) {
            console.error('Cancellation error:', error);
            alert(`Failed to cancel subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    // Premium Active View
    if (isPremium) {
        return (
            <div className="premium-settings">
                <div className="premium-header">
                    <Sparkles className="text-yellow-500" size={48} />
                    <h2 className="text-3xl font-bold mt-4">Premium Active</h2>
                    <PremiumBadge size="medium" />
                </div>

                <div className="subscription-info bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-6 rounded-lg mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Next Billing Date</p>
                            <p className="text-lg font-semibold">
                                {expiresAt ? new Date(expiresAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                }) : 'Lifetime'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Days Remaining</p>
                            <p className="text-2xl font-bold text-yellow-600">{daysRemaining}</p>
                        </div>
                    </div>

                    {((subscription as unknown as Record<string, unknown>)?.cancel_at_period_end || subscription?.cancelAtPeriodEnd) && (
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-lg flex items-start gap-3">
                            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <p className="font-semibold text-yellow-800 dark:text-yellow-200">Subscription Cancelled</p>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    Premium access will end on {expiresAt ? new Date(expiresAt).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="features-grid grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {PREMIUM_FEATURES.map((feature) => (
                        <div key={feature.id} className="feature-card p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div>{feature.icon}</div>
                                    <div>
                                        <h4 className="font-semibold">{feature.name}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                                    </div>
                                </div>
                                {!feature.available && <ComingSoonBadge />}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="actions mt-6 flex gap-4">
                    <button
                        onClick={() => setShowPayments(!showPayments)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        <CreditCard size={18} />
                        {showPayments ? 'Hide' : 'View'} Payment History
                    </button>

                    {!((subscription as unknown as Record<string, unknown>)?.cancel_at_period_end || subscription?.cancelAtPeriodEnd) && (
                        <button
                            onClick={handleCancel}
                            disabled={loading}
                            className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            {loading ? 'Processing...' : 'Cancel Subscription'}
                        </button>
                    )}
                </div>

                {showPayments && (
                    <div className="payment-history mt-6">
                        <h3 className="text-lg font-semibold mb-3">Payment History</h3>
                        {payments.length > 0 ? (
                            <div className="space-y-2">
                                {payments.map((payment) => (
                                    <div key={payment.id} className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div>
                                            <p className="font-medium">₹{payment.amount.toFixed(2)}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(payment.createdAt).toLocaleDateString('en-IN')}
                                            </p>
                                        </div>
                                        <span className={`text-sm px-2 py-1 rounded ${payment.status === 'captured'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                            }`}>
                                            {payment.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
                                <p>No payment records found.</p>
                                <p className="text-xs mt-1">(Records start from 10th Dec 2025 update)</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Debug Info (Only visible if issues persist) */}
                <div className="mt-8 pt-4 border-t border-gray-100 text-[10px] text-gray-400 font-mono">
                    <p>DEBUG ID: {(subscription as unknown as Record<string, unknown>)?.razorpay_subscription_id as string || subscription?.razorpaySubscriptionId || 'NONE'}</p>
                    <p>STATUS: {(subscription as unknown as Record<string, unknown>)?.status as string || subscription?.status || 'UNKNOWN'}</p>
                    <p>V: 2.3.1 (Hotfix)</p>
                </div>
            </div>
        );
    }

    // Upgrade to Premium View
    return (
        <div className="premium-upgrade max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <Sparkles className="text-yellow-500 mx-auto mb-4" size={64} />
                <h1 className="text-4xl font-bold mb-2">Upgrade to Premium</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Automate your finances. Save 30+ minutes daily.
                </p>
            </div>

            <div className="pricing-card bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-8 rounded-2xl shadow-lg mb-8">
                <div className="text-center">
                    <div className="pricing-amount mb-4">
                        <span className="text-5xl font-bold">₹149</span>
                        <span className="text-2xl text-gray-600 dark:text-gray-400">/month</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">
                        Cancel anytime • No commitment • Instant access
                    </p>
                    <button
                        onClick={handleSubscribe}
                        disabled={loading}
                        className="
              w-full px-8 py-4 
              bg-gradient-to-r from-yellow-400 to-orange-500 
              text-white text-lg font-semibold rounded-xl
              hover:from-yellow-500 hover:to-orange-600 
              transition-all transform hover:scale-105
              shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
            "
                    >
                        {loading ? 'Processing...' : 'Subscribe Now'}
                    </button>
                </div>
            </div>

            <div className="features-section">
                <h2 className="text-2xl font-bold mb-4 text-center">Premium Features</h2>
                <div className="space-y-4">
                    {PREMIUM_FEATURES.map((feature) => (
                        <div key={feature.id} className="feature-item flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>{feature.icon}</div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-semibold text-lg">{feature.name}</h3>
                                    {!feature.available && <ComingSoonBadge />}
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="value-proposition mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold mb-3">Why Premium?</h3>
                <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Never manually log expenses again - snap, speak, or auto-sync</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Save 30+ minutes daily with automation</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Unlimited AI financial advisor conversations</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        <span>All future premium features included at no extra cost</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};
