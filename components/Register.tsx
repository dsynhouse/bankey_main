import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { requestOtp, verifyOtp } from '../services/authService';
import Mascot from './Mascot';
import DsynLabsLogo from './DsynLabsLogo';
import { ArrowRight, Sparkles, Mail, User, Loader2, ArrowLeft } from 'lucide-react';

const Register: React.FC = () => {
    const [step, setStep] = useState<'details' | 'otp'>('details');
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError("Name is required.");
            return;
        }
        if (!contact.trim()) {
            setError("Email is required.");
            return;
        }

        setLoading(true);

        try {
            const response = await requestOtp(contact);
            setLoading(false);
            if (response.success) {
                setStep('otp');
            } else {
                setError(response.message);
            }
        } catch {
            setLoading(false);
            setError("Failed to send code.");
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await verifyOtp(contact, otp, name);
            if (response.success && response.user) {
                navigate('/dashboard');
            } else {
                setLoading(false);
                setError(response.message || "Invalid code.");
            }
        } catch {
            setLoading(false);
            setError("Verification failed.");
        }
    };

    return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-4 relative overflow-hidden font-sans">
            <div className="absolute top-0 right-0 w-96 h-96 bg-banky-blue rounded-full filter blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-banky-green rounded-full filter blur-3xl opacity-30 -translate-x-1/2 translate-y-1/2"></div>

            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white border-4 border-ink shadow-neo-lg relative z-10">

                {/* Right Side - Form */}
                <div className="p-8 md:p-12 flex flex-col justify-center order-2 md:order-1 text-ink">
                    <div className="flex items-center gap-2 mb-8">
                        <Mascot className="w-8 h-8" isStatic mood="happy" />
                        <span className="text-2xl font-black italic font-display">bankey.</span>
                        <DsynLabsLogo className="h-5 ml-2" />
                    </div>

                    <h1 className="text-3xl font-black text-ink uppercase mb-2 font-display">
                        {step === 'details' ? "Join the Clan" : "Verify Account"}
                    </h1>
                    <p className="text-gray-500 font-bold mb-6">
                        {step === 'details' ? "Create your account." : `Enter the code sent to ${contact}.`}
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 text-red-600 font-bold text-sm flex items-center gap-2 animate-shake">
                            <span>💀</span> {error}
                        </div>
                    )}

                    {step === 'details' ? (
                        <form onSubmit={handleSendCode} className="space-y-4 animate-fade-in">
                            <div>
                                <label className="block text-xs font-black uppercase mb-1 font-display">Full Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full border-2 border-ink p-4 pl-12 font-bold focus:shadow-neo-sm outline-none transition-shadow bg-ink text-white placeholder-gray-500"
                                        placeholder="e.g. Jordan Wolf"
                                    />
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase mb-1 font-display">Email Address</label>
                                <div className="relative flex-1">
                                    <input
                                        type="email"
                                        required
                                        value={contact}
                                        onChange={(e) => setContact(e.target.value)}
                                        className="w-full border-2 border-ink p-4 pl-12 font-bold focus:shadow-neo-sm outline-none transition-shadow bg-ink text-white placeholder-gray-500"
                                        placeholder="you@example.com"
                                    />
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>

                            <div className="flex items-start gap-2 text-sm font-bold text-gray-500 mb-4 pt-2">
                                <input type="checkbox" required className="mt-1 w-4 h-4 border-2 border-ink rounded-none accent-ink" />
                                <span>I accept the Terms & Conditions of bankey.</span>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-banky-yellow text-fixed-ink font-black uppercase tracking-wider border-2 border-ink shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2 font-display disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Code"}
                                {!loading && <ArrowRight className="w-5 h-5" />}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-4 animate-fade-in-up">
                            <div className="bg-gray-50 border-2 border-dashed border-gray-300 p-4 text-center rounded-lg mb-4">
                                <p className="text-xs font-bold text-gray-400 uppercase">Sent To</p>
                                <p className="font-black text-ink">{contact}</p>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase mb-1 font-display">Verification Code</label>
                                <input
                                    type="text"
                                    maxLength={8}
                                    autoFocus
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="w-full border-2 border-ink p-4 text-center font-black text-2xl tracking-[0.2em] focus:shadow-neo-sm outline-none transition-shadow bg-ink text-white placeholder-gray-500"
                                    placeholder="12345678"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-banky-green text-fixed-ink font-black uppercase tracking-wider border-2 border-ink shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2 font-display disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Let's Go"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep('details')}
                                className="w-full text-center text-xs font-black uppercase text-gray-400 hover:text-ink mt-4 flex items-center justify-center gap-1"
                            >
                                <ArrowLeft className="w-3 h-3" /> Edit Details
                            </button>
                        </form>
                    )}

                    <p className="mt-8 text-center font-bold text-gray-500">
                        Already part of the crew? <Link to="/login" className="text-ink underline hover:text-banky-pink">Log In</Link>
                    </p>
                </div>

                {/* Left Side - Promo */}
                <div className="bg-ink order-1 md:order-2 p-12 flex flex-col items-center justify-center relative overflow-hidden text-white">
                    <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAABVJREFUKFNjZCASMIIA7R6q6R5K5wAAbk8BCk/7u7AAAAAASUVORK5CYII=')] opacity-10"></div>

                    <div className="relative z-10 text-center">
                        <div className="inline-block p-4 bg-banky-pink border-2 border-white rotate-3 mb-8 shadow-[4px_4px_0px_0px_#fff]">
                            <Sparkles className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-4xl font-black uppercase mb-6 font-display">Level Up Your Life</h2>
                        <div className="mt-12 opacity-50">
                            <Mascot className="w-32 h-32 mx-auto" mood="cool" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
