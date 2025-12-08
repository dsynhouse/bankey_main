
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, TrendingUp, Wallet, Brain, Target, Crown, BookOpen, Compass, BarChart3, Layout, ShieldCheck, Twitter, Instagram, Linkedin, Calculator, CreditCard, Send, Plus, Coins } from 'lucide-react';
import Mascot from './Mascot';
import DsynLabsLogo from './DsynLabsLogo';

const LandingPage: React.FC = () => {
    const [savingsInput, setSavingsInput] = useState(50);
    const [sliderValue, setSliderValue] = useState(50);
    const [demoAction, setDemoAction] = useState<'idle' | 'sending' | 'adding'>('idle');
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });

        const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
        elements.forEach(el => observerRef.current?.observe(el));

        return () => observerRef.current?.disconnect();
    }, []);

    const handleDemoAction = (action: 'sending' | 'adding') => {
        if (demoAction !== 'idle') return;
        setDemoAction(action);
        setTimeout(() => setDemoAction('idle'), 2000);
    };

    return (
        <div className="min-h-screen bg-paper overflow-x-hidden selection:bg-banky-pink selection:text-ink font-sans">
            <style>{`
        @keyframes coinDrop {
          0% { transform: translateY(-60px) rotateY(0deg); opacity: 0; }
          20% { opacity: 1; }
          80% { transform: translateY(10px) rotateY(180deg); opacity: 1; }
          100% { transform: translateY(25px) rotateY(360deg); opacity: 0; }
        }
        .animate-coin-drop {
          animation: coinDrop 1s cubic-bezier(0.5, 0, 0.5, 1) forwards;
        }
      `}</style>

            {/* Nav */}
            <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto sticky top-0 bg-paper/90 backdrop-blur-md z-50 border-b-2 border-transparent transition-all">
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="relative">
                        <div className="absolute inset-0 bg-banky-yellow rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <Mascot className="w-10 h-10 relative z-10" isStatic mood="cool" />
                    </div>
                    <span className="text-3xl font-black tracking-tighter font-display italic group-hover:translate-x-1 transition-transform">bankey.</span>
                    <DsynLabsLogo className="h-6 ml-2 hidden sm:block" />
                </div>
                <div className="flex gap-2 sm:gap-4 items-center">
                    <Link to="/login" className="hidden md:block px-6 py-2 font-bold hover:underline font-display uppercase tracking-wider text-sm">
                        Log In
                    </Link>
                    <Link to="/register" className="bg-ink text-banky-yellow px-3 sm:px-6 py-2 sm:py-3 border-2 border-transparent hover:bg-banky-yellow hover:text-ink hover:border-ink hover:shadow-neo font-black transition-all font-display uppercase tracking-wider text-xs sm:text-sm flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                        <span className="hidden xs:inline">Join the</span> <span className="xs:hidden">Join</span><span className="hidden xs:inline"> Clan</span> <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-6 pt-10 pb-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh] relative">
                {/* Background Blob */}
                <div className="absolute top-20 left-10 w-64 h-64 bg-banky-yellow/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
                <div className="absolute bottom-10 right-1/2 w-48 h-48 bg-banky-blue/20 rounded-full blur-3xl -z-10"></div>

                <div className="space-y-8 relative z-10 reveal-left active">

                    <div className="inline-flex items-center gap-2 bg-white border-2 border-ink px-4 py-1.5 font-bold uppercase tracking-wider transform -rotate-2 shadow-neo-sm font-mono text-xs">
                        <span className="w-2 h-2 bg-banky-green rounded-full animate-pulse"></span>
                        Finances, but make it slap.
                    </div>

                    <h1 className="text-7xl md:text-9xl font-black leading-[0.9] tracking-tighter font-display drop-shadow-sm text-ink">
                        Money <br />
                        Made <br />
                        <span className="relative inline-block text-ink">
                            Simple.
                            <span className="absolute bottom-2 left-0 w-full h-4 bg-banky-yellow -z-10 transform -rotate-1"></span>
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl font-medium leading-relaxed max-w-lg text-gray-800 font-sans border-l-4 border-banky-pink pl-6">
                        The <span className="font-bold">missing playbook</span> to help you <span className="font-bold">track, invest</span>, and <span className="font-bold">build wealth</span> without the <span className="font-bold italic">boring jargon & technical sheets</span>. No cap.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Link to="/register" className="px-8 py-4 bg-banky-green border-2 border-ink text-lg font-black uppercase tracking-wide shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 group font-display">
                            Join the Clan <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="flex items-center gap-4 text-sm font-bold text-gray-500 pt-2 font-sans">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-ink text-ink" />
                            <Star className="w-4 h-4 fill-ink text-ink" />
                            <Star className="w-4 h-4 fill-ink text-ink" />
                            <Star className="w-4 h-4 fill-ink text-ink" />
                            <Star className="w-4 h-4 fill-ink text-ink" />
                        </div>
                        <p>Your bank account will thank you.</p>
                    </div>
                </div>

                {/* Hero Illustration */}
                <div className="relative reveal-right active mt-8 lg:mt-0 perspective-1000">

                    {/* Decorative Badge */}
                    <div className="absolute -bottom-8 -left-8 z-30 animate-spin-slow hidden md:block">
                        <div className="relative w-24 h-24">
                            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                                <path id="curve" d="M 50 50 m -37 0 a 37 37 0 1 1 74 0 a 37 37 0 1 1 -74 0" fill="transparent" />
                                <text className="font-black font-display uppercase tracking-widest text-[10px]">
                                    <textPath href="#curve">
                                        • No Boomer Advice • Just Facts •
                                    </textPath>
                                </text>
                            </svg>
                            <div className="absolute inset-0 m-auto w-12 h-12 bg-banky-pink rounded-full border-2 border-ink flex items-center justify-center shadow-neo-sm">
                                <Crown className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Main Interface Card Wrapper */}
                    <div className="relative z-10 max-w-md mx-auto transform rotate-2 hover:rotate-0 transition-transform duration-500">

                        {/* Sticker - Popped Out */}
                        <div className="absolute -top-6 -right-6 z-30 animate-bounce-slow">
                            <div className="bg-banky-yellow border-2 border-ink p-3 shadow-neo-sm rounded-full">
                                <Layout className="w-8 h-8 text-ink" />
                            </div>
                        </div>

                        {/* Card Content */}
                        <div className="bg-white border-4 border-ink p-6 md:p-8 shadow-neo-xl rounded-3xl overflow-hidden relative z-10">

                            {/* Interaction Overlay */}
                            {demoAction === 'sending' && (
                                <div className="absolute inset-0 z-50 bg-banky-blue/95 flex flex-col items-center justify-center text-white animate-fade-in">
                                    <Send className="w-16 h-16 mb-4 animate-bounce" />
                                    <h3 className="text-3xl font-black font-display uppercase">Sent!</h3>
                                </div>
                            )}
                            {demoAction === 'adding' && (
                                <div className="absolute inset-0 z-50 bg-banky-green/95 flex flex-col items-center justify-center text-ink animate-fade-in">
                                    <Coins className="w-16 h-16 mb-4 animate-bounce" />
                                    <h3 className="text-3xl font-black font-display uppercase">Chaching!</h3>
                                </div>
                            )}

                            {/* Mock App UI */}
                            <div className="mt-12 space-y-5 font-sans">
                                <div className="flex justify-between items-end border-b-2 border-ink pb-4">
                                    <div>
                                        <p className="text-xs font-black uppercase text-gray-400 tracking-widest mb-1 font-display">Total Net Worth</p>
                                        <h2 className="text-4xl font-black tracking-tighter font-display">$12,450<span className="text-banky-green">.00</span></h2>
                                    </div>
                                    <div className="bg-black text-banky-green px-2 py-1 font-mono text-xs font-bold rounded-sm">
                                        +24%
                                    </div>
                                </div>

                                {/* Visual Chart */}
                                <div className="flex items-end gap-2 h-24 border-b-2 border-ink pb-1 bg-gray-50 p-2 rounded-lg border-2 border-transparent">
                                    {[30, 45, 35, 60, 50, 80, 70].map((h, i) => (
                                        <div key={i} className="flex-1 bg-ink hover:bg-banky-pink transition-colors rounded-t-sm" style={{ height: `${h}%` }}></div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white border-2 border-ink p-3 rounded-xl flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer shadow-neo-sm">
                                        <div className="bg-banky-blue border-2 border-ink p-2 rounded-lg text-white">
                                            <TrendingUp className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-gray-500 font-display">Investments</p>
                                            <p className="font-black text-sm font-display">$4,200</p>
                                        </div>
                                    </div>
                                    <div className="bg-white border-2 border-ink p-3 rounded-xl flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer shadow-neo-sm">
                                        <div className="bg-banky-purple border-2 border-ink p-2 rounded-lg text-white">
                                            <Target className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-gray-500 font-display">Stash</p>
                                            <p className="font-black text-sm font-display">Trip Fund</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => handleDemoAction('sending')}
                                        className="flex-1 bg-banky-yellow border-2 border-ink p-2 text-center font-black text-sm shadow-neo-sm cursor-pointer hover:translate-y-1 hover:shadow-none transition-all font-display uppercase tracking-wider flex items-center justify-center gap-1"
                                    >
                                        <Send className="w-3 h-3" /> Pay
                                    </button>
                                    <button
                                        onClick={() => handleDemoAction('adding')}
                                        className="flex-1 bg-banky-green border-2 border-ink p-2 text-center font-black text-sm shadow-neo-sm cursor-pointer hover:translate-y-1 hover:shadow-none transition-all font-display uppercase tracking-wider flex items-center justify-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" /> Add
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Mascot - Popped Out (Placed after card to ensure z-index stacking works) */}
                        <div className="absolute -top-12 -left-4 z-50 pointer-events-none">
                            <Mascot className="w-28 h-28 drop-shadow-lg" mood="cool" />

                            {/* Coin Drop Animation */}
                            {demoAction === 'adding' && (
                                <div className="absolute -top-20 left-1/2 -translate-x-1/2 animate-coin-drop">
                                    <div className="w-8 h-8 bg-banky-yellow border-2 border-ink rounded-full flex items-center justify-center shadow-sm">
                                        <span className="font-bold text-xs">$</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive Reality Check Section */}
            <div className="bg-ink text-paper py-20 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,#121212_25%,#1a1a1a_25%,#1a1a1a_50%,#121212_50%,#121212_75%,#1a1a1a_75%,#1a1a1a_100%)] bg-[length:40px_40px] opacity-10"></div>

                <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 border-2 border-white px-4 py-1 rounded-full mb-8 font-mono text-sm uppercase tracking-widest text-white/70">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> Reality Check
                    </div>

                    <h2 className="text-4xl md:text-7xl font-black font-display leading-tight tracking-tight">
                        school taught you <br className="md:hidden" />
                        <span className="relative inline-block px-4 py-1 mx-2 group/calc cursor-help border-b-4 border-banky-blue/50 hover:bg-banky-blue hover:text-ink hover:border-transparent transition-all rounded-lg">
                            calculus
                        </span>
                        but forgot to <br className="hidden md:block" /> teach you
                        <span className="relative inline-block px-4 py-1 mx-2 group/credit cursor-help border-b-4 border-banky-green/50 hover:bg-banky-green hover:text-ink hover:border-transparent transition-all rounded-lg">
                            credit.
                        </span>
                    </h2>

                    <div className="flex justify-center mt-12 gap-8 md:gap-16">
                        <div className="flex flex-col items-center gap-3 opacity-50 hover:opacity-100 transition-opacity">
                            <Calculator className="w-12 h-12 text-banky-blue" />
                            <p className="font-mono text-sm font-bold uppercase tracking-widest">The Old Way</p>
                        </div>
                        <div className="w-px h-20 bg-gray-800"></div>
                        <div className="flex flex-col items-center gap-3">
                            <CreditCard className="w-12 h-12 text-banky-green animate-bounce-slow" />
                            <p className="font-mono text-sm font-bold uppercase tracking-widest text-banky-green">The Bankey Way</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Marquee Stripe */}
            <div className="bg-banky-yellow text-ink py-4 border-y-4 border-ink overflow-hidden transform rotate-1 origin-right scale-105 z-20 relative shadow-xl">
                <div className="whitespace-nowrap animate-marquee flex gap-12">
                    {[...Array(8)].map((_, i) => (
                        <span key={i} className="text-2xl font-black uppercase tracking-widest flex items-center gap-12 font-display">
                            NO MORE JARGON <Layout className="w-6 h-6 text-white stroke-black stroke-[2px]" />
                            SECURE THE BAG <BarChart3 className="w-6 h-6 text-white stroke-black stroke-[2px]" />
                            FINANCIAL FREEDOM <Compass className="w-6 h-6 text-white stroke-black stroke-[2px]" />
                        </span>
                    ))}
                </div>
            </div>

            {/* The Vision Section */}
            <div className="py-24 max-w-4xl mx-auto px-6 text-center reveal relative">
                <div className="absolute top-10 right-10 hidden lg:block rotate-12 opacity-50">
                    <div className="w-24 h-24 bg-banky-purple rounded-full border-2 border-ink flex items-center justify-center">
                        <span className="font-black text-white uppercase text-center text-xs font-display">Future<br />Proof</span>
                    </div>
                </div>

                <div className="inline-block border-2 border-ink px-4 py-1 rounded-full mb-6 font-bold text-sm uppercase tracking-widest bg-white font-display">Our Mission</div>
                <h2 className="text-4xl md:text-6xl font-black uppercase font-display leading-tight mb-8">
                    The Financial Playbook <br />
                    <span className="text-banky-pink">You Never Got.</span>
                </h2>
                <p className="text-xl md:text-2xl text-gray-600 font-medium leading-relaxed max-w-3xl mx-auto font-sans">
                    Millions of us enter the real world without knowing how to manage money. It's a crisis.
                    <br /><br />
                    <span className="text-ink font-bold">Bankey is here to fix that.</span> We turn complex systems into simple steps so you can stop stressing and start winning.
                </p>
            </div>

            {/* Comparison Slider */}
            <div className="py-20 bg-ink text-paper relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-12 reveal">
                        <h2 className="text-5xl md:text-7xl font-black uppercase font-display mb-4 text-white">The Difference</h2>
                        <p className="text-xl text-gray-400 font-medium max-w-2xl mx-auto font-sans">
                            See how we change the game. <span className="font-bold text-white">Drag the slider.</span>
                        </p>
                    </div>

                    {/* Slider Component */}
                    <div className="relative bg-gray-900 border-4 border-gray-700 rounded-3xl overflow-hidden shadow-2xl h-[500px] md:h-[500px] flex flex-col items-center justify-center reveal-left group select-none">

                        {/* Overlay Slider Control */}
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={sliderValue}
                            onChange={(e) => setSliderValue(parseInt(e.target.value))}
                            className="absolute inset-0 z-50 w-full h-full opacity-0 cursor-ew-resize"
                            aria-label="Compare The Confusion vs The System"
                        />

                        {/* Right Side Content (System) - Bottom Layer */}
                        <div className="absolute inset-0 w-full h-full bg-paper flex flex-col items-center justify-center p-8 text-ink z-10">
                            <div className="text-center w-full max-w-lg mx-auto flex flex-col items-center">
                                <h3 className="text-4xl md:text-6xl font-black uppercase text-banky-green mb-8 font-display drop-shadow-[3px_3px_0px_#1A1A1A]">The System</h3>
                                <ul className="space-y-6 text-ink font-bold text-xl md:text-2xl font-sans uppercase flex flex-col items-center">
                                    <li className="flex items-center gap-4 uppercase"><span className="bg-banky-green text-ink w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 border-ink shadow-neo-sm">✓</span> Step-by-Step Learning</li>
                                    <li className="flex items-center gap-4 uppercase"><span className="bg-banky-green text-ink w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 border-ink shadow-neo-sm">✓</span> Automated Tracking</li>
                                    <li className="flex items-center gap-4 uppercase"><span className="bg-banky-green text-ink w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 border-ink shadow-neo-sm">✓</span> Building Wealth</li>
                                    <li className="flex items-center gap-4 uppercase"><span className="bg-banky-green text-ink w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 border-ink shadow-neo-sm">✓</span> Investment Paths</li>
                                </ul>
                            </div>
                        </div>

                        {/* Left Side Content (Chaos) - Top Layer */}
                        <div
                            className="absolute inset-0 w-full h-full bg-[#1a1a1a] flex flex-col items-center justify-center p-8 transition-all z-20"
                            style={{ clipPath: `polygon(0 0, ${sliderValue}% 0, ${sliderValue}% 100%, 0 100%)` }}
                        >
                            <div className="text-center w-full max-w-lg mx-auto flex flex-col items-center">
                                <h3 className="text-4xl md:text-6xl font-black uppercase text-gray-500 mb-8 font-display">The Confusion</h3>
                                <ul className="space-y-6 text-gray-400 font-bold text-xl md:text-2xl font-sans uppercase flex flex-col items-center">
                                    <li className="flex items-center gap-4 opacity-50 uppercase"><span className="text-red-500 text-2xl font-sans">×</span> Zero Guidance</li>
                                    <li className="flex items-center gap-4 opacity-50 uppercase"><span className="text-red-500 text-2xl font-sans">×</span> Messy Spreadsheets</li>
                                    <li className="flex items-center gap-4 opacity-50 uppercase"><span className="text-red-500 text-2xl font-sans">×</span> Living Paycheck to Paycheck</li>
                                    <li className="flex items-center gap-4 opacity-50 uppercase"><span className="text-red-500 text-2xl font-sans">×</span> Fear of Investing</li>
                                </ul>
                            </div>
                        </div>

                        {/* Slider Handle Visual */}
                        <div className="absolute top-0 bottom-0 w-1 bg-banky-yellow z-30 cursor-ew-resize flex items-center justify-center pointer-events-none" style={{ left: `${sliderValue}%` }}>
                            <div className="w-12 h-12 bg-white border-4 border-ink rounded-full flex items-center justify-center shadow-neo-sm transform active:scale-95 transition-transform">
                                <div className="flex gap-1">
                                    <div className="w-1 h-4 bg-ink rounded-full"></div>
                                    <div className="w-1 h-4 bg-ink rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="py-24 bg-paper max-w-7xl mx-auto px-6 relative">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] bg-[size:40px_40px] opacity-30 -z-10 pointer-events-none"></div>

                <div className="text-center mb-16 reveal">
                    <h2 className="text-5xl md:text-6xl font-black uppercase font-display mb-4">Your Financial <span className="text-banky-pink">Toolkit</span></h2>
                    <p className="text-gray-500 font-bold max-w-2xl mx-auto text-lg font-sans">Everything you need to navigate the economy without a degree in finance.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[minmax(250px,auto)]">
                    {/* Large Card: AI Advisor */}
                    <div className="md:col-span-2 bg-white border-2 border-ink shadow-neo p-8 relative overflow-hidden group hover:-translate-y-1 transition-transform reveal-left flex flex-col justify-between">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Brain className="w-64 h-64" />
                        </div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-banky-purple text-white border-2 border-ink px-3 py-1 font-black uppercase text-xs mb-6 shadow-neo-sm font-display">
                                <Brain className="w-4 h-4" /> AI Bestie
                            </div>
                            <h3 className="text-3xl font-black uppercase mb-4 font-display">Financial Hype Man</h3>
                            <p className="text-gray-600 font-medium mb-8 max-w-md text-lg font-sans">
                                Have a question? Just ask. Our AI breaks down complex topics like taxes, interest rates, and stocks into plain English. It's like having a financial planner in your pocket.
                            </p>
                        </div>
                        {/* Chat UI snippet */}
                        <div className="bg-gray-50 border-2 border-ink p-4 rounded-xl w-full max-w-md self-end shadow-sm">
                            <div className="flex gap-3 mb-4">
                                <div className="bg-white border-2 border-ink px-4 py-2 rounded-lg text-sm font-bold shadow-sm rounded-tl-none font-sans">
                                    What's an ETF?
                                </div>
                            </div>
                            <div className="flex gap-3 flex-row-reverse">
                                <div className="bg-banky-yellow border-2 border-ink px-4 py-2 rounded-lg text-sm font-bold shadow-sm rounded-tr-none font-sans">
                                    Think of it like a basket of different stocks. Instead of buying one egg, you buy the whole basket! 🥚
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Small Card: Gamification */}
                    <div className="bg-banky-blue border-2 border-ink shadow-neo p-8 flex flex-col justify-between group hover:-translate-y-1 transition-transform reveal-right relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 text-white opacity-20 rotate-12">
                            <Crown className="w-40 h-40" />
                        </div>
                        <div>
                            <Crown className="w-12 h-12 text-white mb-6 drop-shadow-md stroke-black stroke-[1.5px]" />
                            <h3 className="text-2xl font-black uppercase text-white mb-2 drop-shadow-[2px_2px_0px_#1A1A1A] font-display">Learn & Earn</h3>
                            <p className="text-white font-bold border-l-4 border-white pl-4 text-lg font-sans">Turn financial literacy into a game. Earn XP, unlock badges, and build your streak.</p>
                        </div>
                    </div>

                    {/* Small Card: Privacy */}
                    <div className="bg-banky-green border-2 border-ink shadow-neo p-8 flex flex-col justify-between group hover:-translate-y-1 transition-transform reveal-left relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 text-ink opacity-10 rotate-12">
                            <ShieldCheck className="w-40 h-40" />
                        </div>
                        <div>
                            <ShieldCheck className="w-12 h-12 text-ink mb-6" />
                            <h3 className="text-2xl font-black uppercase text-ink mb-2 font-display">Locked Down</h3>
                            <p className="text-ink font-bold border-l-4 border-ink pl-4 text-lg font-sans">Your data is yours. We use bank-level encryption to keep your financial life safe.</p>
                        </div>
                    </div>

                    {/* Medium Card: Education */}
                    <div className="md:col-span-2 bg-white border-2 border-ink shadow-neo p-8 flex flex-col md:flex-row items-center gap-8 reveal-right">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 bg-banky-pink text-white border-2 border-ink px-3 py-1 font-black uppercase text-xs mb-6 shadow-neo-sm font-display">
                                <BookOpen className="w-4 h-4" /> The Academy
                            </div>
                            <h3 className="text-3xl font-black uppercase mb-4 font-display">Interactive Lessons</h3>
                            <p className="text-gray-600 font-medium text-lg font-sans">
                                Forget boring textbooks. Our interactive modules teach you the essentials: budgeting, saving, investing, and avoiding debt traps.
                            </p>
                        </div>
                        <div className="flex-1 w-full flex justify-center">
                            <div className="relative w-full max-w-xs">
                                <div className="absolute top-0 right-0 w-full h-full bg-ink rounded-xl translate-x-2 translate-y-2"></div>
                                <div className="relative bg-white border-2 border-ink p-6 rounded-xl flex flex-col gap-4">
                                    <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-300">
                                        <div className="w-2/3 h-full bg-banky-green"></div>
                                    </div>
                                    <div className="font-bold text-center font-display">Unit 1: The Basics</div>
                                    <div className="flex gap-2 justify-center">
                                        <div className="w-8 h-8 rounded-full bg-banky-yellow border-2 border-ink flex items-center justify-center font-black text-xs font-mono">A</div>
                                        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-gray-300"></div>
                                        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-gray-300"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive Savings Simulator */}
            <div className="bg-ink py-20 text-paper border-t-4 border-ink relative">
                <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>

                <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row gap-16 items-center">
                    <div className="flex-1 reveal-left space-y-6">
                        <div className="inline-block bg-banky-green text-ink border-2 border-white px-3 py-1 font-black uppercase rotate-2 shadow-[4px_4px_0px_0px_#fff] font-display">Simulator</div>
                        <h2 className="text-5xl md:text-6xl font-black uppercase font-display leading-tight">
                            Small Habits, <br /> <span className="text-banky-yellow">Big Drip.</span>
                        </h2>
                        <p className="text-xl text-gray-400 font-medium font-sans">
                            See how cutting out small daily expenses can transform your future wealth.
                        </p>

                        <div className="bg-gray-800 p-8 rounded-2xl border-2 border-gray-600">
                            <div className="flex justify-between items-end mb-6">
                                <label className="text-gray-400 font-bold uppercase text-sm tracking-widest font-display">Weekly Savings</label>
                                <span className="text-4xl font-black text-banky-yellow font-display">${savingsInput}</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="500"
                                step="10"
                                value={savingsInput}
                                onChange={(e) => setSavingsInput(parseInt(e.target.value))}
                                className="w-full h-4 bg-gray-600 rounded-full appearance-none cursor-pointer accent-banky-green"
                            />
                            <div className="flex justify-between mt-2 text-gray-500 font-mono text-xs">
                                <span>$10</span>
                                <span>$500</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full bg-paper text-ink p-8 md:p-12 border-4 border-banky-pink shadow-[12px_12px_0px_0px_#FF90E8] reveal-right rotate-1 rounded-3xl">
                        <div className="space-y-6">
                            <div className="flex items-center gap-6 p-6 border-2 border-ink bg-white shadow-neo-sm rounded-xl hover:-translate-y-1 transition-transform">
                                <div className="bg-banky-yellow p-4 border-2 border-ink shadow-neo-sm rounded-lg">
                                    <Wallet className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase text-gray-500 tracking-wider font-display">In 1 Year</p>
                                    <p className="text-4xl font-black font-display">${(savingsInput * 52).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 p-6 border-2 border-ink bg-banky-green/20 shadow-neo-sm rounded-xl hover:-translate-y-1 transition-transform relative overflow-hidden">
                                <div className="bg-banky-blue p-4 border-2 border-ink shadow-neo-sm rounded-lg relative z-10">
                                    <TrendingUp className="w-8 h-8 text-white" />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-xs font-black uppercase text-gray-600 tracking-wider font-display">In 10 Years (Invested @ 8%)</p>
                                    <p className="text-4xl font-black font-display">
                                        ${Math.round(savingsInput * 52 * (((1.08 ** 10) - 1) / 0.08)).toLocaleString()}
                                    </p>
                                </div>
                                {/* Background chart visual */}
                                <div className="absolute bottom-0 right-0 w-32 h-16 flex items-end gap-1 opacity-20">
                                    <div className="w-4 h-4 bg-banky-green"></div>
                                    <div className="w-4 h-8 bg-banky-green"></div>
                                    <div className="w-4 h-12 bg-banky-green"></div>
                                    <div className="w-4 h-10 bg-banky-green"></div>
                                    <div className="w-4 h-16 bg-banky-green"></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <Link to="/register" className="inline-block w-full py-4 bg-ink text-white font-black uppercase tracking-widest hover:bg-banky-yellow hover:text-ink transition-colors border-2 border-transparent hover:border-ink shadow-lg font-display">
                                Start Building Wealth
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white text-ink py-20 border-t-4 border-ink relative overflow-hidden font-sans">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-12">
                        <div className="flex flex-col gap-4 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <Mascot className="w-10 h-10" isStatic mood="cool" />
                                <span className="text-5xl font-black italic font-display tracking-tighter">bankey.</span>
                                <DsynLabsLogo className="h-8 ml-2 hidden sm:block" />
                            </div>
                            <p className="font-medium text-gray-500 max-w-xs leading-relaxed">
                                Empowering the next generation to master their money, one tracking pixel at a time.
                            </p>
                        </div>

                        <div className="flex gap-8 md:gap-16">
                            <div className="flex flex-col gap-4 text-center md:text-left">
                                <h4 className="font-black uppercase text-lg font-display">Platform</h4>
                                <Link to="/education" className="font-bold hover:text-banky-pink transition-colors">Education</Link>
                                <Link to="/tracker" className="font-bold hover:text-banky-pink transition-colors">Receipts</Link>
                                <Link to="/advisor" className="font-bold hover:text-banky-pink transition-colors">Hype Man</Link>
                            </div>
                            <div className="flex flex-col gap-4 text-center md:text-left">
                                <h4 className="font-black uppercase text-lg font-display">Legal</h4>
                                <Link to="/privacy" className="font-bold hover:text-banky-pink transition-colors">Privacy Policy</Link>
                                <Link to="/terms" className="font-bold hover:text-banky-pink transition-colors">Terms of Service</Link>
                                <Link to="/cancellation" className="font-bold hover:text-banky-pink transition-colors">Refund Policy</Link>
                                <Link to="/shipping" className="font-bold hover:text-banky-pink transition-colors">Shipping Policy</Link>
                                <Link to="/contact" className="font-bold hover:text-banky-pink transition-colors">Contact Us</Link>
                            </div>
                        </div>
                    </div>

                    {/* Centered SSL Secure Badge */}
                    <div className="flex justify-center mb-12">
                        <div className="bg-white border-2 border-ink px-4 py-2 shadow-neo-sm rounded-lg flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-banky-green" />
                            <p className="text-xs font-black uppercase font-display tracking-wider">SSL Secure <br /> Encrypted</p>
                        </div>
                    </div>

                    <div className="pt-8 border-t-2 border-gray-100 flex flex-col md:flex-row justify-between items-center text-sm font-bold text-gray-400">
                        <p>© 2024 Bankey Inc. All rights reserved.</p>
                        <div className="flex gap-4 mt-4 md:mt-0">
                            <a href="#" className="w-8 h-8 bg-ink text-white flex items-center justify-center rounded-full hover:bg-banky-pink transition-colors cursor-pointer" aria-label="Twitter">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 bg-ink text-white flex items-center justify-center rounded-full hover:bg-banky-pink transition-colors cursor-pointer" aria-label="Instagram">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 bg-ink text-white flex items-center justify-center rounded-full hover:bg-banky-pink transition-colors cursor-pointer" aria-label="LinkedIn">
                                <Linkedin className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
