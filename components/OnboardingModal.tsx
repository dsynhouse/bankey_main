
import React, { useState } from 'react';
import { useBanky } from '../context/useBanky';
import { AccountType, Currency } from '../types';
import { ArrowRight, Wallet, Check, ShieldCheck, Sparkles } from 'lucide-react';
import Mascot from './Mascot';

// INR only for now - other currencies can be added back later
const DEFAULT_INR_CURRENCY: Currency = { code: 'INR', symbol: '₹', name: 'Indian Rupee' };

const OnboardingModal: React.FC = () => {
    const { userState, createAccount, completeOnboarding, isLoading } = useBanky();
    const [step, setStep] = useState(1);
    const [walletName, setWalletName] = useState('Main Stash');
    const [startingBalance, setStartingBalance] = useState('');
    // Currency is now fixed to INR
    const selectedCurrency = DEFAULT_INR_CURRENCY;

    // 1. If app is loading data, do not show modal (prevents flash)
    if (isLoading) return null;

    // 2. If user has already completed onboarding (from DB), do not show
    if (userState.hasCompletedOnboarding) return null;

    const handleCreateWallet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!walletName || !startingBalance) return;

        const { error } = await createAccount({
            name: walletName,
            type: AccountType.SPENDING,
            balance: parseFloat(startingBalance),
            currency: selectedCurrency.code,
            color: 'bg-banky-green'
        }, selectedCurrency); // Pass selected currency to update profile

        if (error) {
            alert("Failed to create wallet. Please try again.");
            return;
        }

        setStep(3); // Skip to final step (was step 4)
    };

    const handleFinish = async () => {
        await completeOnboarding();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/95 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border-4 border-ink shadow-neo-xl max-w-md w-full relative overflow-hidden p-8">

                {/* Progress Bar - Now 3 steps instead of 4 */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gray-100">
                    <div className="h-full bg-banky-green transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
                </div>

                {/* STEP 1: WELCOME */}
                {step === 1 && (
                    <div className="text-center animate-fade-in">
                        <Mascot className="w-32 h-32 mx-auto mb-6" mood="happy" />
                        <h2 className="text-4xl font-black uppercase font-display mb-4">Welcome to the Clan!</h2>
                        <p className="text-gray-500 font-bold mb-8">
                            Bankey works differently. To track your spending, you first need a place to spend <em>from</em>.
                        </p>
                        <button
                            onClick={() => setStep(2)}
                            className="w-full py-4 bg-ink text-white font-black uppercase tracking-widest shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2"
                        >
                            Let's Set Up <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* STEP 2: CREATE WALLET (was Step 3) */}
                {step === 2 && (
                    <form onSubmit={handleCreateWallet} className="animate-fade-in-right">
                        <div className="flex items-center gap-2 mb-6 text-banky-blue">
                            <Wallet className="w-8 h-8" />
                            <h2 className="text-2xl font-black uppercase font-display text-ink">Setup Wallet</h2>
                        </div>

                        <p className="text-sm font-bold text-gray-500 mb-6 bg-gray-50 p-3 border-l-4 border-banky-blue">
                            Create your main spending account (e.g., Checking, Cash). You can add more later.
                        </p>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-xs font-black uppercase mb-1">Wallet Name</label>
                                <input
                                    autoFocus
                                    required
                                    value={walletName}
                                    onChange={(e) => setWalletName(e.target.value)}
                                    className="w-full border-2 border-ink p-3 font-bold focus:shadow-neo-sm outline-none bg-ink text-white placeholder-gray-500"
                                    placeholder="e.g. Daily Driver"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase mb-1">Current Balance</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-gray-400">{selectedCurrency.symbol}</span>
                                    <input
                                        required
                                        type="number"
                                        value={startingBalance}
                                        onChange={(e) => setStartingBalance(e.target.value)}
                                        className="w-full border-2 border-ink p-3 pl-8 font-bold focus:shadow-neo-sm outline-none bg-ink text-white placeholder-gray-500"
                                        placeholder="0.00"
                                    />
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">How much do you have right now?</p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!startingBalance}
                            className="w-full py-4 bg-banky-blue text-white font-black uppercase tracking-widest shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Create & Continue
                        </button>
                    </form>
                )}


                {/* STEP 3: READY (was Step 4) */}
                {step === 3 && (
                    <div className="text-center animate-fade-in-right">
                        <div className="w-24 h-24 bg-banky-green rounded-full border-4 border-ink flex items-center justify-center mx-auto mb-6 shadow-neo animate-bounce">
                            <Check className="w-12 h-12 text-ink" strokeWidth={4} />
                        </div>
                        <h2 className="text-3xl font-black uppercase font-display mb-4">You are Set!</h2>
                        <div className="bg-gray-50 border-2 border-ink p-4 text-left mb-8 space-y-3">
                            <div className="flex items-start gap-3">
                                <Sparkles className="w-5 h-5 text-banky-yellow flex-shrink-0 mt-0.5 fill-current stroke-black" />
                                <p className="text-sm font-bold"><strong>Lazy Add:</strong> Just type "Spent 20 on food" on the dashboard.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-banky-pink flex-shrink-0 mt-0.5" />
                                <p className="text-sm font-bold"><strong>Privacy:</strong> Your data is encrypted locally.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleFinish}
                            className="w-full py-4 bg-banky-yellow text-ink font-black uppercase tracking-widest shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                        >
                            Enter Dashboard
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default OnboardingModal;
