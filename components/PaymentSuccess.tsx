import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useBanky } from '../context/useBanky';
import { supabase } from '../services/supabase';
import { getUserSubscription } from '../services/razorpayService';
import Mascot from './Mascot';
import Confetti from 'react-confetti';

const PaymentSuccess: React.FC = () => {
    const navigate = useNavigate();
    const { user, refreshProfile } = useBanky();
    const [status, setStatus] = useState<'verifying' | 'success' | 'timeout'>('verifying');
    const [retryCount, setRetryCount] = useState(0);

    // Dynamic window size for confetti
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        let isMounted = true;
        let timeout: NodeJS.Timeout;

        const verifySubscription = async () => {
            if (!user) return;

            try {
                // 1. Check Profile directly (Truth Source)
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_premium')
                    .eq('id', user.id)
                    .single();

                // 2. Also Check Subscription (Backup)
                const sub = await getUserSubscription(user.id);

                const isPremiumActive = (profile && profile.is_premium) || (sub && sub.status === 'active');

                if (isPremiumActive) {
                    if (isMounted) {
                        setStatus('success');
                        // CRITICAL: Force update app-wide context
                        await refreshProfile();

                        // Emit event for any other listeners
                        window.dispatchEvent(new Event('payment-success'));

                        // Auto-redirect after 3 seconds
                        timeout = setTimeout(() => {
                            navigate('/dashboard');
                        }, 4000);
                    }
                } else {
                    // Not active yet, retry
                    if (retryCount < 15) { // Try for ~30 seconds (15 retries x 2s)
                        timeout = setTimeout(() => {
                            if (isMounted) setRetryCount(prev => prev + 1);
                        }, 2000);
                    } else {
                        if (isMounted) setStatus('timeout');
                    }
                }
            } catch (error) {
                console.error("Verification error", error);
                if (isMounted) {
                    // Don't fail immediately, retry a few times unless exhausted
                    if (retryCount < 15) {
                        timeout = setTimeout(() => {
                            if (isMounted) setRetryCount(prev => prev + 1);
                        }, 2000);
                    } else {
                        setStatus('timeout');
                    }
                }
            }
        };

        if (status === 'verifying') {
            verifySubscription();
        }

        return () => {
            isMounted = false;
            clearTimeout(timeout);
        };
    }, [user, retryCount, status, refreshProfile, navigate]);

    return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-6 font-sans relative overflow-hidden">
            {status === 'success' && <Confetti width={windowSize.width} height={windowSize.height} numberOfPieces={200} recycle={false} />}

            <div className="max-w-md w-full bg-white border-4 border-ink shadow-neo-xl p-8 rounded-3xl text-center relative z-10 transition-all duration-500">

                {status === 'verifying' && (
                    <div className="animate-pulse">
                        <Mascot className="w-24 h-24 mx-auto mb-6 opacity-80" mood="cool" isStatic />
                        <h2 className="text-2xl font-black uppercase font-display mb-2">Verifying...</h2>
                        <p className="text-gray-500 font-medium mb-2">Hold tight, we're securing your spot in the clan.</p>
                        <p className="text-xs text-gray-400 mb-6">Check {retryCount + 1}/15</p>
                        <Loader2 className="w-8 h-8 mx-auto animate-spin text-banky-blue" />
                    </div>
                )}

                {status === 'success' && (
                    <div className="animate-in fade-in zoom-in duration-300">
                        <div className="relative inline-block mb-6">
                            <div className="absolute inset-0 bg-yellow-300 rounded-full blur-xl opacity-50 animate-pulse"></div>
                            <CheckCircle className="w-24 h-24 text-banky-green relative z-10 fill-white" />
                        </div>
                        <h2 className="text-3xl font-black uppercase font-display mb-2 text-ink">You're In!</h2>
                        <p className="text-gray-600 font-medium mb-8">
                            Premium unlocked. Get ready to level up your finances.
                        </p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-3 bg-ink text-white font-black uppercase tracking-wider rounded-xl shadow-lg hover:translate-y-1 hover:shadow-md transition-all flex items-center justify-center gap-2"
                        >
                            Go to Dashboard <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {status === 'timeout' && (
                    <div className="animate-in fade-in">
                        <AlertCircle className="w-20 h-20 mx-auto mb-6 text-banky-yellow" />
                        <h2 className="text-2xl font-black uppercase font-display mb-2">Payment Received</h2>
                        <p className="text-gray-600 font-medium mb-4 text-sm">
                            We got your payment! Our servers are taking a bit longer than usual to sync.
                        </p>
                        <div className="bg-blue-50 border-2 border-ink p-4 rounded-lg mb-6 text-left text-sm">
                            <p className="font-bold mb-2">✓ Your payment was successful</p>
                            <p className="text-gray-600 mb-1">Your premium should activate within 2-3 minutes.</p>
                            <p className="text-gray-600">Try refreshing the page or check your dashboard.</p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3 mb-3 bg-ink text-white font-black uppercase tracking-wider rounded-xl shadow-neo-sm hover:translate-y-1 hover:shadow-none transition-all"
                        >
                            Refresh Page
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-3 bg-white border-2 border-ink text-ink font-black uppercase tracking-wider rounded-xl shadow-neo-sm hover:translate-y-1 hover:shadow-none transition-all"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
