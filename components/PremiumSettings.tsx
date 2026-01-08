import React, { useState, useEffect, useCallback } from 'react';
import { useBanky } from '../context/useBanky';
import { usePremium } from '../context/usePremium';
import {
    initiateSubscription,
    cancelSubscription,
    getUserSubscription,
    getPaymentHistory
} from '../services/razorpayService';
import { PremiumBadge } from './PremiumBadge';
import {
    Sparkles,
    CreditCard,
    AlertCircle,
    ScanText,
    Mic,
    Landmark,
    Bot,
    Check,
    Loader2
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
            <div className="premium-settings animate-fade-in space-y-8">
                {/* Hero Status Card */}
                {/* Hero Status Card */}
                <div className="bg-banky-yellow border-4 border-ink p-8 shadow-neo rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                        <Sparkles size={200} />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <PremiumBadge size="medium" />
                                <span className="bg-ink text-white px-2 py-0.5 text-xs font-black uppercase tracking-wider rounded-sm">Active</span>
                            </div>
                            <h2 className="text-4xl font-black uppercase italic font-display text-ink">Premium Member</h2>
                            <p className="font-bold text-ink/80 mt-1">You're automating your financial life.</p>
                        </div>

                        {/* Stats Crystal Balls */}
                        <div className="flex gap-4">
                            <div className="bg-white border-2 border-ink p-4 shadow-neo-sm min-w-[120px] text-center">
                                <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Renews In</p>
                                <p className="text-3xl font-black font-display text-ink">{daysRemaining}</p>
                                <p className="text-[10px] font-bold uppercase text-ink">Days</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subscription Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Info Card */}
                    <div className="bg-white border-2 border-ink p-6 shadow-neo">
                        <h3 className="text-xl font-black uppercase font-display mb-6 flex items-center gap-2">
                            <CreditCard className="w-5 h-5" /> Subscription
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 border-2 border-ink">
                                <span className="font-bold text-gray-600 uppercase text-xs">Next Billing</span>
                                <span className="font-black text-ink">
                                    {expiresAt ? new Date(expiresAt).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    }) : 'Lifetime'}
                                </span>
                            </div>

                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {((subscription as unknown as Record<string, unknown>)?.cancel_at_period_end || (subscription as any)?.cancelAtPeriodEnd) && (
                                <div className="bg-red-50 border-2 border-red-500 p-4 flex items-start gap-3">
                                    <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <p className="font-black text-red-600 uppercase text-sm">Cancellation Scheduled</p>
                                        <p className="text-xs font-bold text-red-500">
                                            Access ends on {expiresAt ? new Date(expiresAt).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowPayments(!showPayments)}
                                    className="flex-1 py-3 border-2 border-ink font-black uppercase text-xs hover:bg-gray-50 transition-colors"
                                >
                                    {showPayments ? 'Hide History' : 'Payment History'}
                                </button>

                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {!((subscription as unknown as Record<string, unknown>)?.cancel_at_period_end || (subscription as any)?.cancelAtPeriodEnd) && (
                                    <button
                                        onClick={handleCancel}
                                        disabled={loading}
                                        className="flex-1 py-3 border-2 border-red-500 text-red-500 font-black uppercase text-xs hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Processing...' : 'Cancel Plan'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Features List */}
                    <div className="bg-white border-2 border-ink p-6 shadow-neo">
                        <h3 className="text-xl font-black uppercase font-display mb-6 flex items-center gap-2">
                            <Sparkles className="w-5 h-5" /> Enabled Features
                        </h3>
                        <div className="space-y-3">
                            {PREMIUM_FEATURES.map((feature) => (
                                <div key={feature.id} className={`flex items-center gap-3 p-3 border-2 border-transparent ${feature.available ? 'bg-banky-green/20 border-banky-green/50' : 'opacity-50 grayscale'}`}>
                                    <div className="p-1.5 bg-white border border-ink rounded-full shadow-sm">
                                        {React.cloneElement(feature.icon as React.ReactElement, { className: "w-4 h-4" })}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm leading-tight">{feature.name}</p>
                                    </div>
                                    {!feature.available && <span className="text-[10px] font-black uppercase bg-gray-200 px-1 border border-gray-400">Soon</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Payment History Table */}
                {showPayments && (
                    <div className="bg-white border-2 border-ink p-6 shadow-neo animate-fade-in">
                        <h3 className="text-xl font-black uppercase font-display mb-4">Payment History</h3>
                        {payments.length > 0 ? (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-ink text-xs uppercase text-gray-500">
                                        <th className="py-2">Date</th>
                                        <th className="py-2">Amount</th>
                                        <th className="py-2 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm font-bold">
                                    {payments.map((payment) => (
                                        <tr key={payment.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                            <td className="py-3">{new Date(payment.createdAt).toLocaleDateString('en-IN')}</td>
                                            <td className="py-3">₹{payment.amount.toFixed(2)}</td>
                                            <td className="py-3 text-right">
                                                <span className={`inline-block px-2 py-0.5 text-[10px] uppercase border border-current rounded ${payment.status === 'captured' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'
                                                    }`}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-8 text-center border-2 border-dashed border-gray-300">
                                <p className="font-bold text-gray-400">No payment records found yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Upgrade to Premium View (Sales Page)
    return (
        <div className="premium-upgrade max-w-2xl mx-auto py-8">
            {/* Value Prop */}
            <div className="text-center mb-10">
                <div className="inline-block relative">
                    <div className="absolute inset-0 bg-banky-yellow blur-xl opacity-50"></div>
                    <Sparkles className="text-ink relative z-10 w-16 h-16 mx-auto mb-4" />
                </div>
                <h1 className="text-5xl font-black uppercase italic font-display mb-3 tracking-tighter">
                    Go Premium
                </h1>
                <p className="text-xl font-bold text-gray-600">
                    Stop manually tracking. Start living.
                </p>
            </div>

            {/* Pricing Card */}
            <div className="bg-white border-4 border-ink shadow-neo-xl p-8 mb-10 rounded-xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute top-0 right-0 bg-banky-yellow text-ink text-xs font-black uppercase px-3 py-1 border-l-2 border-b-2 border-ink z-20">
                    Best Value
                </div>

                <div className="text-center mb-8 relative z-10">
                    <div className="flex items-center justify-center gap-1 mb-2">
                        <span className="text-6xl font-black font-display tracking-tighter">₹149</span>
                        <span className="text-xl font-bold text-gray-400 self-end mb-2">/mo</span>
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                        Cancel anytime • No commitment
                    </p>
                </div>

                <div className="space-y-4 mb-8">
                    {PREMIUM_FEATURES.map((feature) => (
                        <div key={feature.id} className="flex items-start gap-4">
                            <div className={`p-1 mt-0.5 rounded border-2 border-ink ${feature.available ? 'bg-banky-green text-ink' : 'bg-gray-100 text-gray-400 border-gray-300'}`}>
                                <Check className="w-3 h-3 stroke-[4]" />
                            </div>
                            <div>
                                <h3 className={`font-black uppercase text-sm ${feature.available ? 'text-ink' : 'text-gray-400 line-through decoration-2'}`}>
                                    {feature.name}
                                </h3>
                                <p className="text-xs font-bold text-gray-500 leading-tight mt-0.5 pr-4">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleSubscribe}
                    disabled={loading}
                    className="w-full py-4 bg-banky-yellow border-2 border-ink text-ink text-lg font-black uppercase tracking-wider shadow-neo hover:bg-banky-pink hover:text-white hover:shadow-neo-sm transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group-hover:shadow-neo-lg"
                >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-5 h-5 fill-current" />}
                    {loading ? 'Processing...' : 'Upgrade Now'}
                </button>
            </div>

            <div className="text-center">
                <p className="text-xs font-bold text-gray-400 uppercase">
                    Secure 256-bit SSL Encrypted Payment via Razorpay
                </p>
            </div>
        </div>
    );
};

