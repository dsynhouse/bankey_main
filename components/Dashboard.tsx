import React, { useState } from 'react';
import { useBanky } from '../context/useBanky';
import { ArrowUpRight, ArrowDownRight, TrendingUp, GraduationCap, Zap, Wallet, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Category } from '../types';
import BillSplitter from './BillSplitter';
import DreamBoard from './DreamBoard.tsx';

const Dashboard: React.FC = () => {
    const { accounts, transactions, addTransaction, user, currency, userState } = useBanky();
    const [activeTab, setActiveTab] = useState<'overview' | 'dreamboard' | 'bills'>('overview');
    const [quickAddTab, setQuickAddTab] = useState<'spend' | 'earn'>('spend');

    // Quick Add State
    const [flashSpendAmount, setFlashSpendAmount] = useState('');
    const [flashSpendCategory, setFlashSpendCategory] = useState('Food');
    const [flashEarnAmount, setFlashEarnAmount] = useState('');
    const [flashEarnSource, setFlashEarnSource] = useState('Salary');

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const currencySymbol = currency.symbol;





    // Mock total units count for progress bar (should match Education.tsx)
    const totalUnits = 44;
    const rawProgress = (userState.completedUnitIds?.length || 0) / totalUnits * 100;
    const progressPercent = Math.min(rawProgress, 100);

    const formatCurrency = (value: number) => {
        return `${currency.symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const recentTransactions = transactions.slice(0, 4);

    const handleFlashSpend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!flashSpendAmount) return;

        if (accounts.length === 0) {
            alert("Please create a wallet first in the Wallets tab!");
            return;
        }

        const amount = parseFloat(flashSpendAmount);
        if (amount <= 0) {
            alert("Amount must be positive!");
            return;
        }

        addTransaction({
            date: new Date().toISOString(),
            amount: amount,
            category: flashSpendCategory as Category, // Simplified for now
            description: flashSpendCategory,
            accountId: accounts[0].id,
            type: 'expense'
        });

        setFlashSpendAmount('');
        setFlashSpendCategory('Food');
    };

    const handleFlashEarn = (e: React.FormEvent) => {
        e.preventDefault();
        if (!flashEarnAmount) return;

        if (accounts.length === 0) {
            alert("Please create a wallet first in the Wallets tab!");
            return;
        }

        const amount = parseFloat(flashEarnAmount);
        if (amount <= 0) {
            alert("Amount must be positive!");
            return;
        }

        addTransaction({
            date: new Date().toISOString(),
            amount: amount,
            category: Category.INCOME,
            description: flashEarnSource,
            accountId: accounts[0].id,
            type: 'income'
        });

        setFlashEarnAmount('');
        setFlashEarnSource('Salary');
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
            {/* Header / Welcome */}
            <div className="bg-banky-yellow border-4 border-ink p-6 shadow-neo transform hover:-translate-y-1 transition-transform duration-300 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 overflow-hidden">
                {/* Left Side: Text */}
                <div className="text-center md:text-left min-w-0 flex-1">
                    <h1 className="text-3xl md:text-4xl xl:text-5xl font-black uppercase italic tracking-tighter text-ink font-display mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                        YO, {user?.name || 'ROHAN'}!
                    </h1>
                    <p className="text-lg md:text-xl font-bold text-ink font-sans tracking-tight">Let's build that wealth.</p>
                </div>

                {/* Right Side: Date & Tabs */}
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 flex-shrink-0">
                    {/* Date */}
                    <div className="bg-white border-2 border-ink p-2 px-4 shadow-neo-sm transform -rotate-2 hover:rotate-0 transition-transform">
                        <p className="font-mono font-bold text-ink text-sm md:text-base whitespace-nowrap">
                            {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="bg-white border-2 border-ink p-1 shadow-neo-sm flex">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-2 font-black uppercase tracking-wider text-xs md:text-sm transition-all whitespace-nowrap ${activeTab === 'overview'
                                ? 'bg-ink text-white shadow-sm'
                                : 'bg-transparent text-gray-400 hover:text-ink'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('dreamboard')}
                            className={`px-4 py-2 font-black uppercase tracking-wider text-xs md:text-sm transition-all whitespace-nowrap ${activeTab === 'dreamboard'
                                ? 'bg-banky-pink text-ink shadow-sm'
                                : 'bg-transparent text-gray-400 hover:text-ink'
                                }`}
                        >
                            Dream Board
                        </button>
                        <button
                            onClick={() => setActiveTab('bills')}
                            className={`px-4 py-2 font-black uppercase tracking-wider text-xs md:text-sm transition-all whitespace-nowrap ${activeTab === 'bills'
                                ? 'bg-banky-purple text-white shadow-sm'
                                : 'bg-transparent text-gray-400 hover:text-ink'
                                }`}
                        >
                            Bill Splitter
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            {activeTab === 'overview' && (
                <div className="space-y-8">
                    {/* Top Row: Quick Add & Recent Moves */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Quick Add (Combined Flash Spend/Earn) */}
                        <div className="bg-white border-4 border-ink shadow-neo overflow-hidden h-full">
                            <div className="flex border-b-4 border-ink">
                                <button
                                    onClick={() => setQuickAddTab('spend')}
                                    className={`flex-1 py-4 font-black uppercase flex items-center justify-center gap-2 transition-colors ${quickAddTab === 'spend' ? 'bg-banky-pink text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                >
                                    <Zap className="w-5 h-5" /> Flash Spend
                                </button>
                                <button
                                    onClick={() => setQuickAddTab('earn')}
                                    className={`flex-1 py-4 font-black uppercase flex items-center justify-center gap-2 transition-colors ${quickAddTab === 'earn' ? 'bg-banky-green text-ink' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                >
                                    <TrendingUp className="w-5 h-5" /> Flash Earn
                                </button>
                            </div>

                            <div className="p-6">
                                {quickAddTab === 'spend' ? (
                                    <form onSubmit={handleFlashSpend} className="flex flex-col gap-4">
                                        <div className="flex gap-4 items-end">
                                            <div className="flex-1">
                                                <label className="block text-xs font-black uppercase mb-1 text-gray-500">Amount</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-3 font-bold text-gray-400">{currencySymbol}</span>
                                                    <input
                                                        type="number"
                                                        value={flashSpendAmount}
                                                        onChange={(e) => setFlashSpendAmount(e.target.value)}
                                                        placeholder="0.00"
                                                        className="w-full border-2 border-ink p-3 pl-8 font-mono font-bold outline-none focus:shadow-neo-sm transition-shadow"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs font-black uppercase mb-1 text-gray-500">Category</label>
                                                <select
                                                    value={flashSpendCategory}
                                                    onChange={(e) => setFlashSpendCategory(e.target.value)}
                                                    className="w-full border-2 border-ink p-3 font-bold outline-none focus:shadow-neo-sm transition-shadow bg-white"
                                                >
                                                    <option value="Food">Food</option>
                                                    <option value="Transport">Transport</option>
                                                    <option value="Leisure">Leisure</option>
                                                    <option value="Shopping">Shopping</option>
                                                    <option value="Bills">Bills</option>
                                                    <option value="Investment">Investment</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full bg-ink text-white p-3 border-2 border-transparent hover:bg-banky-pink hover:border-ink hover:text-white font-black uppercase transition-all shadow-neo hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                                        >
                                            Blast It!
                                        </button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleFlashEarn} className="flex flex-col gap-4">
                                        <div className="flex gap-4 items-end">
                                            <div className="flex-1">
                                                <label className="block text-xs font-black uppercase mb-1 text-gray-500">Amount</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-3 font-bold text-gray-400">{currencySymbol}</span>
                                                    <input
                                                        type="number"
                                                        value={flashEarnAmount}
                                                        onChange={(e) => setFlashEarnAmount(e.target.value)}
                                                        placeholder="0.00"
                                                        className="w-full border-2 border-ink p-3 pl-8 font-mono font-bold outline-none focus:shadow-neo-sm transition-shadow"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs font-black uppercase mb-1 text-gray-500">Source</label>
                                                <select
                                                    value={flashEarnSource}
                                                    onChange={(e) => setFlashEarnSource(e.target.value)}
                                                    className="w-full border-2 border-ink p-3 font-bold outline-none focus:shadow-neo-sm transition-shadow bg-white"
                                                >
                                                    <option value="Salary">Salary</option>
                                                    <option value="Freelance">Freelance</option>
                                                    <option value="Gift">Gift</option>
                                                    <option value="Investment">Stonks</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full bg-ink text-white p-3 border-2 border-transparent hover:bg-banky-green hover:border-ink hover:text-ink font-black uppercase transition-all shadow-neo hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                                        >
                                            Ka-Ching!
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Recent Moves */}
                        <div className="bg-white border-4 border-ink p-6 shadow-neo h-full flex flex-col">
                            <h3 className="text-xl font-black uppercase font-display mb-6 flex items-center gap-2">
                                <Clock className="w-6 h-6 text-banky-purple" /> Recent Moves
                            </h3>
                            <div className="space-y-4 flex-1">
                                {recentTransactions.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400 font-mono text-sm">
                                        No moves yet. Go spend some cash!
                                    </div>
                                ) : (
                                    recentTransactions.map(t => (
                                        <div key={t.id} className="flex items-center justify-between p-3 border-2 border-gray-100 hover:border-ink hover:bg-gray-50 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full border-2 border-ink ${t.type === 'expense' ? 'bg-banky-pink text-white' : 'bg-banky-green text-ink'}`}>
                                                    {t.type === 'expense' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-ink leading-tight">{t.description}</p>
                                                    <p className="text-xs font-mono text-gray-500">{new Date(t.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className={`font-black font-mono ${t.type === 'expense' ? 'text-banky-pink' : 'text-banky-green'}`}>
                                                {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                            <button className="w-full mt-6 py-2 border-2 border-dashed border-gray-300 text-gray-400 font-bold uppercase hover:border-ink hover:text-ink transition-colors text-sm">
                                View All History
                            </button>
                        </div>
                    </div>

                    {/* Bottom Row: Net Worth & Financial IQ */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Net Worth Card */}
                        <div className="lg:col-span-2 bg-white border-4 border-ink p-6 shadow-neo relative overflow-hidden group">
                            <div className="absolute top-0 right-0 bg-banky-green px-4 py-1 border-l-4 border-b-4 border-ink font-black uppercase text-xs tracking-widest">
                                Total Balance
                            </div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-banky-blue border-2 border-ink rounded-full">
                                    <Wallet className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-black uppercase font-display">Net Worth</h2>
                            </div>
                            <p className="text-5xl md:text-7xl font-black text-ink tracking-tighter font-display mb-4">
                                {formatCurrency(totalBalance)}
                            </p>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2 text-banky-green font-bold bg-green-50 px-3 py-1 rounded-full border-2 border-green-200">
                                    <ArrowUpRight className="w-5 h-5" />
                                    <span>+12% this month</span>
                                </div>
                            </div>
                        </div>

                        {/* Financial IQ Teaser */}
                        <div className="bg-banky-purple p-6 shadow-neo border-4 border-ink text-white flex flex-col justify-between relative overflow-hidden group h-full">
                            <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAABVJREFUKFNjZCASMIIA7R6q6R5K5wAAbk8BCk/7u7AAAAAASUVORK5CYII=')] opacity-10"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="bg-white text-ink border-2 border-ink p-1 shadow-neo-sm">
                                        <GraduationCap className="w-6 h-6" />
                                    </div>
                                    <span className="font-black tracking-widest bg-ink text-white px-2 py-1 transform -rotate-2 font-display uppercase">The Academy</span>
                                </div>
                                <h3 className="text-3xl font-black mb-2 uppercase leading-none drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] font-display">Financial IQ</h3>

                                <div className="mt-4 mb-2">
                                    <div className="flex justify-between text-xs font-bold uppercase mb-1 text-white">
                                        <span>Current Progress</span>
                                        <span>{Math.round(progressPercent)}%</span>
                                    </div>
                                    <div className="w-full h-4 bg-black/30 border border-white/30 rounded-full overflow-hidden">
                                        <div className="h-full bg-banky-yellow" style={{ width: `${progressPercent}%` }}></div>
                                    </div>
                                </div>

                                <p className="text-white font-medium text-sm opacity-90 leading-relaxed mt-2">
                                    Next Up: Credit Scores & Taxes. Don't let the IRS catch you slipping.
                                </p>
                            </div>
                            <Link to="/education" className="relative z-10 mt-6 w-full bg-banky-yellow text-fixed-ink border-2 border-ink shadow-neo font-black py-4 text-center hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase tracking-wider text-lg font-display">
                                Continue Learning
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'dreamboard' && (
                <div className="animate-slide-up">
                    <DreamBoard />
                </div>
            )}

            {activeTab === 'bills' && (
                <div className="animate-slide-up">
                    <BillSplitter />
                </div>
            )}
        </div>
    );
};

export default Dashboard;
