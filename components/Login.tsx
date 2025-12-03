
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBanky } from '../context/useBanky';
import { requestOtp, verifyOtp } from '../services/authService';
import Mascot from './Mascot';
import DsynLabsLogo from './DsynLabsLogo';
import { ArrowRight, Mail, KeyRound, Loader2, ArrowLeft, Check } from 'lucide-react';

const Login: React.FC = () => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const { login } = useBanky();
  const navigate = useNavigate();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
      setError("Connection error. Please try again.");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await verifyOtp(contact, otp);

      if (response.success && response.user) {
        // Set persistence preference in context
        // Casting to any because the context type definition might need update, but implementation supports it
        await login(rememberMe);
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
      <div className="absolute top-0 left-0 w-64 h-64 bg-banky-yellow rounded-full filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-banky-pink rounded-full filter blur-3xl opacity-20 translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white border-4 border-ink shadow-neo-lg relative z-10">

        <div className="bg-banky-green border-b-4 md:border-b-0 md:border-r-4 border-ink p-12 flex flex-col items-center justify-center relative overflow-hidden text-fixed-ink">
          <div className="absolute inset-0 bg-[radial-gradient(#121212_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
          <Mascot className="w-48 h-48 mb-8" mood="cool" />
          <h2 className="text-4xl font-black uppercase text-center leading-none font-display">Log In</h2>
          <p className="font-bold mt-4 text-center text-lg">Secure the bag. Check the stats.</p>
        </div>

        <div className="p-8 md:p-12 flex flex-col justify-center text-ink">
          <div className="flex items-center gap-2 mb-8">
            <Mascot className="w-8 h-8" isStatic mood="happy" />
            <span className="text-2xl font-black italic font-display">bankey.</span>
            <DsynLabsLogo className="h-5 ml-2" />
          </div>

          <h1 className="text-3xl font-black uppercase mb-2 font-display">
            {step === 'email' ? "Welcome Back" : "Security Check"}
          </h1>
          <p className="text-gray-500 font-bold mb-6">
            {step === 'email' ? "Enter your email to begin." : `Enter the code sent to ${contact}.`}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 text-red-600 font-bold text-sm flex items-center gap-2 animate-shake">
              <span>🚫</span> {error}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-black uppercase mb-1 font-display">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full border-2 border-ink p-4 pl-12 font-bold focus:shadow-neo-sm outline-none transition-shadow bg-ink text-white placeholder-gray-500"
                    placeholder="name@domain.com"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-ink text-paper font-black uppercase tracking-wider border-2 border-transparent hover:bg-banky-yellow hover:text-fixed-ink hover:border-ink hover:shadow-neo transition-all flex items-center justify-center gap-2 group font-display disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Code'}
                {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>

              <div
                className="flex items-center gap-2 cursor-pointer mt-2 select-none"
                onClick={() => setRememberMe(!rememberMe)}
              >
                <div className={`w-5 h-5 border-2 border-ink flex items-center justify-center transition-colors ${rememberMe ? 'bg-banky-green' : 'bg-white'}`}>
                  {rememberMe && <Check className="w-3 h-3 text-ink stroke-[4]" />}
                </div>
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Stay Signed In</span>
              </div>

            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4 animate-fade-in-up">
              <div>
                <label className="block text-xs font-black uppercase mb-1 font-display">Verification Code</label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={8}
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full border-2 border-ink p-4 pl-12 font-black text-2xl tracking-[0.2em] focus:shadow-neo-sm outline-none transition-shadow bg-ink text-white placeholder-gray-600"
                    placeholder="12345678"
                  />
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-banky-yellow text-fixed-ink font-black uppercase tracking-wider border-2 border-ink shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2 font-display disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Login"}
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-center text-xs font-black uppercase text-gray-400 hover:text-ink mt-4 flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Wrong Email
              </button>
            </form>
          )}

          <p className="mt-8 text-center font-bold text-gray-500">
            New to the squad? <Link to="/register" className="text-ink underline hover:text-banky-pink">Join the Clan</Link>
          </p>


        </div>
      </div>
    </div>
  );
};

export default Login;
