
import React, { useState } from 'react';
import { useBanky } from '../context/useBanky';
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, GraduationCap, ArrowRight, Target, Plus, X, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import CategoryIcon from './CategoryIcon';
import { Category, Goal } from '../types';

const Dashboard: React.FC = () => {
    const { accounts, transactions, addTransaction, user, currency, userState, goals, addGoal, updateGoal } = useBanky();
    const [activeTab, setActiveTab] = useState<'overview' | 'dreams'>('overview');

    // Goal Form State
    const [isAddingGoal, setIsAddingGoal] = useState(false);
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [newGoalAmount, setNewGoalAmount] = useState('');
    const [newGoalEmoji, setNewGoalEmoji] = useState('🎯');

    // Goal Update State
    const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
    const [addFundsAmount, setAddFundsAmount] = useState('');

    // Quick Add State
    const [quickAmount, setQuickAmount] = useState('');
    const [quickDesc, setQuickDesc] = useState('');
    const [quickCategory, setQuickCategory] = useState<Category>(Category.FOOD);

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    // Calculate this month's spending vs income
    const currentMonth = new Date().getMonth();
    const monthlyTransactions = transactions.filter(t => new Date(t.date).getMonth() === currentMonth);

    const monthlyIncome = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpense = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const savingsRate = monthlyIncome > 0 ? Math.round(((monthlyIncome - monthlyExpense) / monthlyIncome) * 100) : 0;

    // Mock total units count for progress bar (should match Education.tsx)
    const totalUnits = 44; // Updated to match expanded module count
    const rawProgress = (userState.completedUnitIds?.length || 0) / totalUnits * 100;
    const progressPercent = Math.min(rawProgress, 100);

    const handleAddGoal = (e: React.FormEvent) => {
        e.preventDefault();
        addGoal({
            id: crypto.randomUUID(),
            title: newGoalTitle,
            targetAmount: parseFloat(newGoalAmount),
            savedAmount: 0,
            emoji: newGoalEmoji
        });
        setIsAddingGoal(false);
        setNewGoalTitle('');
        setNewGoalAmount('');
    };

    const handleUpdateGoalSubmit = (e: React.FormEvent, goal: Goal) => {
        e.preventDefault();
        if (!addFundsAmount) return;

        const added = parseFloat(addFundsAmount);
        const newVal = Math.min(goal.savedAmount + added, goal.targetAmount);
        updateGoal(goal.id, newVal);

        setEditingGoalId(null);
        setAddFundsAmount('');
    };

    const handleQuickAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!quickAmount || !quickDesc) return;

        if (accounts.length === 0) {
            alert("Please create a wallet first in the Wallets tab!");
            return;
        }

        addTransaction({
            date: new Date().toISOString(),
            amount: parseFloat(quickAmount),
            category: quickCategory,
            description: quickDesc,
            accountId: accounts[0].id, // Default to first account
            type: 'expense'
        });

        setQuickAmount('');
        setQuickDesc('');
        setQuickCategory(Category.FOOD);
    };

    return (
        <div className="space-y-8 animate-fade-in font-sans">
            {/* Header */}
            <div className="bg-banky-yellow border-2 border-ink shadow-neo p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-fixed-ink uppercase italic tracking-tighter font-display">Yo, {user?.name || 'Legend'}!</h1>
                    <p className="text-fixed-ink font-bold mt-2 text-lg">Let's build that wealth.</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="bg-white border-2 border-ink px-4 py-2 font-mono text-sm font-bold shadow-neo-sm transform rotate-2 text-ink">
                        {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>

                    {/* View Toggles */}
                    <div className="flex bg-white border-2 border-ink p-1 shadow-neo-sm mt-2">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-1 text-xs font-black uppercase transition-all font-display ${activeTab === 'overview' ? 'bg-ink text-paper shadow-sm' : 'text-gray-400 hover:text-ink'}`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('dreams')}
                            className={`px-4 py-1 text-xs font-black uppercase transition-all font-display ${activeTab === 'dreams' ? 'bg-banky-pink text-fixed-ink border-2 border-ink shadow-sm' : 'text-gray-400 hover:text-ink border-2 border-transparent'}`}
                        >
                            Dream Board
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === 'overview' ? (
                <>
                    {/* Quick Spend Card - Moved to Top */}
                    <div className="bg-white border-2 border-ink shadow-neo p-6 flex flex-col justify-between relative group hover:-translate-y-1 transition-transform">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Zap className="w-24 h-24 rotate-12" />
                        </div>

                        <div>
                            <h3 className="text-2xl font-black text-ink uppercase font-display mb-4 flex items-center gap-2">
                                <Zap className="w-6 h-6 text-banky-yellow fill-current stroke-black" />
                                Flash Spend
                            </h3>
                            <form onSubmit={handleQuickAdd} className="space-y-4 relative z-10">
                                <div>
                                    <label className="text-xs font-black uppercase text-gray-500 font-display">Amount</label>
                                    <div className="flex items-center border-b-4 border-ink focus-within:border-banky-pink transition-colors bg-ink p-2">
                                        <span className="text-xl font-black text-white mr-2">{currency.symbol}</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={quickAmount}
                                            onChange={e => setQuickAmount(e.target.value)}
                                            className="w-full text-3xl font-black text-white outline-none bg-transparent placeholder-gray-500 font-display"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-black uppercase text-gray-500 font-display">For What?</label>
                                    <input
                                        type="text"
                                        value={quickDesc}
                                        onChange={e => setQuickDesc(e.target.value)}
                                        className="w-full border-2 border-ink p-2 font-bold outline-none focus:shadow-neo-sm transition-shadow font-sans bg-ink text-white placeholder-gray-500"
                                        placeholder="Coffee, Uber, etc."
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <select
                                        value={quickCategory}
                                        onChange={e => setQuickCategory(e.target.value as Category)}
                                        className="flex-1 border-2 border-ink p-2 font-bold bg-ink text-white outline-none font-sans"
                                    >
                                        {Object.values(Category).filter(c => c !== Category.INCOME).map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    <button type="submit" className="bg-banky-yellow border-2 border-ink p-2 shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center w-14">
                                        <Plus className="w-6 h-6 text-fixed-ink" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Action & Content Grid (Receipts + Financial IQ) - Moved UP */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Recent Transactions Teaser */}
                        <div className="bg-white p-6 shadow-neo border-2 border-ink">
                            <div className="flex justify-between items-center mb-6 border-b-2 border-ink pb-4">
                                <h3 className="text-2xl font-black text-ink uppercase font-display">Receipts</h3>
                                <Link to="/tracker" className="group flex items-center gap-1 text-ink font-bold hover:bg-banky-yellow px-2 transition-colors">
                                    See All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                            <div className="space-y-3 font-mono">
                                {transactions.slice(0, 4).map(t => (
                                    <div key={t.id} className="flex items-center justify-between p-2 hover:bg-gray-50 border-b border-dashed border-gray-300">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 flex items-center justify-center text-lg border-2 border-ink shadow-neo-sm ${t.type === 'income' ? 'bg-banky-green text-fixed-ink' : 'bg-white text-ink'
                                                }`}>
                                                <CategoryIcon category={t.category} className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-ink leading-tight font-sans truncate max-w-[120px]">{t.description}</p>
                                                <p className="text-xs text-gray-500 font-sans">{new Date(t.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className={`font-bold ${t.type === 'income' ? 'text-banky-green-darker bg-ink px-1 text-banky-green' : 'text-ink'}`}>
                                            {t.type === 'income' ? '+' : '-'}{currency.symbol}{t.amount}
                                        </span>
                                    </div>
                                ))}
                                {transactions.length === 0 && (
                                    <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-300 bg-gray-50">
                                        <p>It's giving... empty. Add a transaction!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Learning Teaser */}
                        <div className="bg-banky-purple p-6 shadow-neo border-2 border-ink text-white flex flex-col justify-between relative overflow-hidden group">
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

                    {/* Main Stats Cards - Moved Down */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Net Worth */}
                        <div className="bg-ink text-paper p-6 shadow-neo border-2 border-ink relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
                            <div className="relative z-10">
                                <p className="text-banky-green font-mono text-sm font-bold mb-2 uppercase tracking-widest border-b border-gray-700 pb-2 inline-block">Total Loot</p>
                                <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight flex items-center gap-1 font-display">
                                    <span className="text-banky-green w-8 inline-block text-center">{currency.symbol}</span>
                                    {totalBalance.toLocaleString()}
                                </h2>
                                <div className="flex items-center gap-2 bg-gray-800 w-fit px-3 py-1 border border-gray-600">
                                    <TrendingUp className="w-4 h-4 text-banky-green" />
                                    <span className="text-banky-green font-bold font-mono">+12% Stonk</span>
                                </div>
                            </div>
                            {/* Pattern BG */}
                            <div className="absolute top-0 right-0 w-full h-full opacity-20 bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:16px_16px]"></div>
                        </div>

                        {/* Income vs Expense */}
                        <div className="bg-white p-6 shadow-neo border-2 border-ink flex flex-col justify-between hover:-translate-y-1 transition-transform duration-200">
                            <div className="flex justify-between items-start mb-4 bg-banky-green/20 p-3 border-2 border-ink">
                                <div>
                                    <p className="text-ink text-xs font-bold uppercase tracking-wider font-display">The Gains (In)</p>
                                    <p className="text-2xl font-black text-ink font-display">{currency.symbol}{monthlyIncome.toLocaleString()}</p>
                                </div>
                                <ArrowUpRight className="w-6 h-6 text-ink stroke-[3px]" />
                            </div>
                            <div className="flex justify-between items-end bg-banky-pink/20 p-3 border-2 border-ink">
                                <div>
                                    <p className="text-ink text-xs font-bold uppercase tracking-wider font-display">The Damage (Out)</p>
                                    <p className="text-2xl font-black text-ink font-display">{currency.symbol}{monthlyExpense.toLocaleString()}</p>
                                </div>
                                <ArrowDownRight className="w-6 h-6 text-ink stroke-[3px]" />
                            </div>
                        </div>

                        {/* Savings Rate / Health */}
                        <div className="bg-banky-blue p-6 shadow-neo border-2 border-ink flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
                            <div className="absolute -bottom-6 -right-6 text-white opacity-40 rotate-12">
                                <DollarSign className="w-40 h-40 stroke-[1.5px]" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-fixed-ink text-sm font-black uppercase tracking-wider bg-white inline-block px-2 border-2 border-ink mb-2 font-display">Savings Vibe</p>
                                <h3 className="text-5xl font-black text-white stroke-black stroke-2 font-display" style={{ WebkitTextStroke: '2px black' }}>{savingsRate}%</h3>
                                <p className="text-fixed-ink text-sm mt-2 font-bold bg-white/50 p-1 inline-block">
                                    {savingsRate > 20 ? "Outstanding Performance!" : "Needs Improvement."}
                                </p>
                            </div>
                            <div className="relative z-10 w-full bg-white h-4 border-2 border-ink mt-4">
                                <div className="bg-ink h-full transition-all duration-1000" style={{ width: `${Math.min(savingsRate, 100)}%` }}></div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                /* --- Dream Board Tab --- */
                <div className="animate-fade-in-up">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-black uppercase font-display text-ink">Vision Board</h2>
                        <button
                            onClick={() => setIsAddingGoal(true)}
                            className="bg-banky-green text-fixed-ink border-2 border-ink px-4 py-2 font-black uppercase shadow-neo hover:-translate-y-1 transition-all flex items-center gap-2 font-display"
                        >
                            <Plus className="w-5 h-5" /> New Goal
                        </button>
                    </div>

                    {isAddingGoal && (
                        <form onSubmit={handleAddGoal} className="bg-white p-6 border-2 border-ink shadow-neo mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end relative">
                            <button type="button" onClick={() => setIsAddingGoal(false)} className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded text-ink"><X className="w-4 h-4" /></button>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black uppercase mb-1 text-ink">Goal Name</label>
                                <input required value={newGoalTitle} onChange={e => setNewGoalTitle(e.target.value)} placeholder="e.g. New Car" className="w-full border-2 border-ink p-2 font-bold focus:shadow-neo-sm outline-none bg-ink text-white placeholder-gray-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase mb-1 text-ink">Target Amount</label>
                                <div className="flex items-center border-2 border-ink bg-ink">
                                    <span className="px-2 font-black text-gray-400">{currency.symbol}</span>
                                    <input required type="number" value={newGoalAmount} onChange={e => setNewGoalAmount(e.target.value)} placeholder="5000" className="w-full p-2 font-bold outline-none bg-transparent text-white placeholder-gray-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase mb-1 text-ink">Icon</label>
                                <input value={newGoalEmoji} onChange={e => setNewGoalEmoji(e.target.value)} placeholder="🏆" className="w-full border-2 border-ink p-2 font-bold text-center bg-ink text-white" maxLength={2} />
                            </div>
                            <button type="submit" className="md:col-span-4 bg-ink text-paper font-black py-3 uppercase tracking-wider font-display hover:bg-gray-800">Create Goal</button>
                        </form>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {goals.map((goal) => {
                            const percent = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
                            const isEditing = editingGoalId === goal.id;

                            return (
                                <div key={goal.id} className="bg-white border-2 border-ink shadow-neo p-6 relative group overflow-hidden">
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className="w-12 h-12 bg-banky-yellow border-2 border-ink flex items-center justify-center text-2xl shadow-neo-sm">
                                            {goal.emoji}
                                        </div>
                                        {!isEditing ? (
                                            <button
                                                onClick={() => setEditingGoalId(goal.id)}
                                                className="text-xs font-bold border-2 border-ink px-2 py-1 bg-white hover:bg-gray-100 uppercase text-ink"
                                            >
                                                + Add Funds
                                            </button>
                                        ) : (
                                            <button onClick={() => setEditingGoalId(null)} className="text-gray-400"><X className="w-4 h-4" /></button>
                                        )}
                                    </div>

                                    <div className="relative z-10">
                                        <h3 className="text-xl font-black uppercase font-display mb-1 text-ink">{goal.title}</h3>
                                        <div className="flex justify-between items-end text-sm font-mono font-bold text-gray-500 mb-2">
                                            <span className="text-ink">{currency.symbol}{goal.savedAmount.toLocaleString()}</span>
                                            <span>{currency.symbol}{goal.targetAmount.toLocaleString()}</span>
                                        </div>

                                        {isEditing ? (
                                            <form onSubmit={(e) => handleUpdateGoalSubmit(e, goal)} className="mb-2 animate-fade-in">
                                                <div className="flex gap-2">
                                                    <input
                                                        autoFocus
                                                        type="number"
                                                        placeholder="Amount"
                                                        value={addFundsAmount}
                                                        onChange={e => setAddFundsAmount(e.target.value)}
                                                        className="w-full border-2 border-ink p-1 px-2 font-bold text-sm bg-ink text-white"
                                                    />
                                                    <button type="submit" className="bg-banky-green border-2 border-ink px-2 font-black shadow-sm"><Plus className="w-4 h-4" /></button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div className="w-full h-4 bg-gray-200 border-2 border-ink rounded-full overflow-hidden">
                                                <div className="h-full bg-banky-green border-r-2 border-ink transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confetti Effect if Complete */}
                                    {percent === 100 && (
                                        <div className="absolute inset-0 bg-banky-green/20 flex items-center justify-center z-20 backdrop-blur-sm">
                                            <div className="bg-white border-2 border-ink p-4 shadow-neo text-center transform rotate-3">
                                                <p className="text-2xl">🎉</p>
                                                <p className="font-black uppercase font-display text-ink">Goal Met!</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}

                        {/* Empty State placeholder */}
                        <button onClick={() => setIsAddingGoal(true)} className="border-4 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-ink hover:text-ink hover:bg-gray-50 transition-all min-h-[200px] group">
                            <Target className="w-12 h-12 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="font-black uppercase font-display">Add Dream</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Version Indicator */}
            <div className="text-center py-4 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                v0.0.1 • Bankey Native (Beta Version)
            </div>
        </div>
    );
};

export default Dashboard;
