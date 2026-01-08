import React, { useState } from 'react';
import { useBanky } from '../context/useBanky';
import { usePreferences } from '../context/PreferencesContext';
import BillSplitter from './BillSplitter';
import DreamBoard from './DreamBoard.tsx';
import WidgetGrid from './widgets/WidgetGrid';
import WidgetLibrary from './widgets/WidgetLibrary';
import { SEO } from './SEO';
import { Sparkles, Grid3x3, Mic, Camera, Plus, Loader2, ChevronLeft, ChevronRight, Trash2, ArrowUpDown } from 'lucide-react';
import VoiceInput from './VoiceInput';
import ReceiptScanner from './ReceiptScanner';
import ForecastWidget from './widgets/ForecastWidget';
import { parseTransactionInput } from '../services/geminiService';
import { Category, Transaction } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { startOfMonth, endOfMonth } from 'date-fns';
import CategoryIcon from './CategoryIcon';

/**
 * Dashboard - AI-forward main dashboard with customizable widgets and integrated tracker
 * Now includes full transaction tracking functionality directly in the dashboard
 */
const Dashboard: React.FC = () => {
    const { user, accounts, transactions, addTransaction, deleteTransaction } = useBanky();
    const { currency } = usePreferences();

    // Main tab state
    const [activeTab, setActiveTab] = useState<'widgets' | 'dreamboard' | 'bills' | 'tracker'>('widgets');

    // Widget-related state
    const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);

    // Global Voice/Scan state
    const [showVoiceInput, setShowVoiceInput] = useState(false);
    const [showReceiptScanner, setShowReceiptScanner] = useState(false);

    // === TRACKER TAB STATE ===
    const [trackerSubTab, setTrackerSubTab] = useState<'list' | 'analytics' | 'calendar'>('list');

    // AI Input State
    const [aiInput, setAiInput] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiAccountId] = useState('');

    // Manual Form State
    const [showManualForm, setShowManualForm] = useState(false);
    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [category, setCategory] = useState<Category>(Category.FOOD);
    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [selectedAccountId] = useState<string>('');


    // Filter and Sort State
    const [listFilter, setListFilter] = useState<'all' | 'expense' | 'income'>('all');
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const [_analyticsView, setAnalyticsView] = useState<'weekly' | 'monthly'>('weekly');
    const [_sortBy, setSortBy] = useState<'date' | 'amount'>('date');
    const [_sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [_dateRange, setDateRange] = useState({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) });
    const [_calendarSelectedDate, setCalendarSelectedDate] = useState<Date | null>(null);
    /* eslint-enable @typescript-eslint/no-unused-vars */

    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDateLog, setSelectedDateLog] = useState<Transaction[] | null>(null);


    // === TRACKER HANDLERS ===
    const handleTypeChange = (newType: 'expense' | 'income') => {
        setType(newType);
        setCategory(newType === 'income' ? Category.INCOME : Category.FOOD);
    };

    const handleAiSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!aiInput.trim()) return;

        const targetAccountId = aiAccountId || (accounts.length > 0 ? accounts[0].id : '');
        setIsAiLoading(true);
        const result = await parseTransactionInput(aiInput);
        setIsAiLoading(false);

        if (result) {
            addTransaction({
                amount: result.amount,
                category: result.category as Category,
                description: result.description,
                type: result.type,
                accountId: targetAccountId,
                date: new Date().toISOString()
            });
            setAiInput('');
        } else {
            alert("Oops! Try saying 'Spent 20 on Pizza'.");
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const targetAccountId = selectedAccountId || accounts[0]?.id || '';
        addTransaction({
            amount: parseFloat(amount),
            category,
            description: desc,
            type,
            accountId: targetAccountId,
            date: new Date().toISOString()
        });
        setAmount('');
        setDesc('');
        setShowManualForm(false);
    };





    // Calendar functions
    const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const changeMonth = (delta: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
        setSelectedDateLog(null);
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50/50 border border-gray-100"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
            const dayTransactions = transactions.filter(t => new Date(t.date).toDateString() === dateStr);
            const dailyIncome = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const dailyExpense = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            const net = dailyIncome - dailyExpense;
            const hasActivity = dayTransactions.length > 0;

            let bgClass = "bg-white hover:bg-gray-50";
            if (hasActivity) {
                if (net > 0) bgClass = "bg-banky-green/20 hover:bg-banky-green/30";
                else if (net < 0) bgClass = "bg-banky-pink/20 hover:bg-banky-pink/30";
                else bgClass = "bg-banky-yellow/20 hover:bg-banky-yellow/30";
            }

            days.push(
                <div key={day} onClick={() => setSelectedDateLog(dayTransactions)} className={`h-24 border border-ink p-2 relative cursor-pointer transition-colors ${bgClass}`}>
                    <span className="font-bold text-xs absolute top-2 left-2">{day}</span>
                    {hasActivity && (
                        <>
                            <div className="absolute bottom-2 right-2 text-xs font-black">{dayTransactions.length} Log{dayTransactions.length > 1 ? 's' : ''}</div>
                            <div className="flex flex-col items-end mt-4 gap-0.5">
                                {dailyIncome > 0 && <span className="text-[10px] text-banky-green font-black">+{currency.symbol}{dailyIncome}</span>}
                                {dailyExpense > 0 && <span className="text-[10px] text-red-500 font-black">-{currency.symbol}{dailyExpense}</span>}
                            </div>
                        </>
                    )}
                </div>
            );
        }
        return days;
    };

    // Filtered and sorted transactions
    const displayTransactions = transactions.filter(t => {
        if (listFilter === 'all') return true;
        return t.type === listFilter;
    }).sort((a, b) => {
        if (_sortBy === 'date') {
            return _sortOrder === 'asc' ?
                new Date(a.date).getTime() - new Date(b.date).getTime() :
                new Date(b.date).getTime() - new Date(a.date).getTime();
        } else {
            return _sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
        }
    });

    // Stats calculations
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netFlow = totalIncome - totalExpense;

    // Chart data
    const dataByCategory = Object.values(Category).map(cat => {
        const total = transactions.filter(t => t.category === cat && t.type === _analyticsView).reduce((sum, t) => sum + t.amount, 0);
        return { name: cat, value: total };
    }).filter(d => d.value > 0);

    const COLORS = ['#DEFF00', '#FF88DC', '#54C7EC', '#00E08F', '#A688FA', '#FF9F1C', '#EF4444', '#121212'];

    const incomeCategories = [Category.INCOME, Category.BUSINESS, Category.INVESTMENT, Category.OTHER];
    const expenseCategories = Object.values(Category).filter(c => c !== Category.INCOME);
    const availableCategories = type === 'income' ? incomeCategories : expenseCategories;

    return (
        <div className="space-y-8 animate-fade-in relative min-h-screen pb-24">
            <SEO title="Home" />

            {/* Redesigned Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white border-4 border-ink p-6 md:p-8 shadow-neo rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-banky-yellow rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10">
                    <p className="font-black text-ink/40 uppercase tracking-widest text-sm mb-2 font-display">
                        {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                    <h1 className="text-3xl md:text-6xl font-black italic text-ink font-display leading-[0.9]">
                        Good Afternoon, <span className="text-transparent bg-clip-text bg-gradient-to-r from-banky-purple to-banky-pink">
                            {user?.name?.split(' ')[0] || 'Saver'}
                        </span>
                    </h1>
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto relative z-10">
                    <button
                        onClick={() => setShowVoiceInput(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border-2 border-ink px-4 py-3 rounded-xl hover:bg-banky-purple hover:text-white transition-all shadow-neo hover:shadow-neo-lg hover:-translate-y-1 group"
                    >
                        <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-black uppercase text-xs">Voice</span>
                    </button>
                    <button
                        onClick={() => setShowReceiptScanner(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border-2 border-ink px-4 py-3 rounded-xl hover:bg-banky-green hover:text-white transition-all shadow-neo hover:shadow-neo-lg hover:-translate-y-1 group"
                    >
                        <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-black uppercase text-xs">Scan</span>
                    </button>

                    {activeTab === 'widgets' && (
                        <button
                            onClick={() => setShowWidgetLibrary(true)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-ink text-white border-2 border-ink px-4 py-3 rounded-xl hover:bg-banky-yellow hover:text-ink transition-all shadow-neo hover:shadow-neo-lg hover:-translate-y-1 group"
                        >
                            <Grid3x3 className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            <span className="font-black uppercase text-xs">Widgets</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Segmented Pill Navigation */}
            <div className="flex justify-center -mt-4 relative z-20">
                <div className="inline-flex bg-white p-2 border-2 border-ink rounded-2xl shadow-neo overflow-x-auto max-w-full no-scrollbar">
                    {[
                        { id: 'tracker', label: 'Tracker', icon: ArrowUpDown },
                        { id: 'dreamboard', label: 'Dreams', icon: Sparkles },
                        { id: 'bills', label: 'Squads', icon: Plus }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl font-black uppercase text-xs md:text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-banky-yellow text-ink shadow-sm scale-105 border-2 border-ink'
                                : 'text-gray-400 hover:text-ink hover:bg-gray-50'
                                }`}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-ink' : ''}`} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="min-h-0 animate-slide-up">
                {activeTab === 'widgets' && <WidgetGrid onAddWidget={() => setShowWidgetLibrary(true)} />}

                {activeTab === 'tracker' && (
                    <div className="bg-white border-4 border-ink shadow-neo rounded-xl overflow-hidden animate-fade-in pb-8">
                        {/* Tracker Header */}
                        <div className="bg-banky-yellow border-b-4 border-ink p-6 flex items-center gap-4">
                            <div className="w-12 h-12 bg-white border-2 border-ink shadow-neo rounded-xl flex items-center justify-center -rotate-3">
                                <Sparkles className="w-6 h-6 text-ink" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black uppercase italic font-display">Tracker</h2>
                                <p className="font-bold text-sm opacity-70">Manage your flow</p>
                            </div>
                        </div>

                        {/* Tracker Content Container */}
                        <div className="p-6 space-y-8">

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-banky-green/10 border-2 border-banky-green p-4 rounded-xl flex flex-col items-center text-center shadow-sm">
                                    <span className="text-xs font-black uppercase text-banky-green-darker tracking-widest mb-1">In</span>
                                    <span className="text-2xl font-black text-banky-green-darker font-mono">+{currency.symbol}{totalIncome.toLocaleString()}</span>
                                </div>
                                <div className="bg-red-50 border-2 border-red-200 p-4 rounded-xl flex flex-col items-center text-center shadow-sm">
                                    <span className="text-xs font-black uppercase text-red-400 tracking-widest mb-1">Out</span>
                                    <span className="text-2xl font-black text-red-500 font-mono">-{currency.symbol}{totalExpense.toLocaleString()}</span>
                                </div>
                                <div className={`border-2 p-4 rounded-xl flex flex-col items-center text-center shadow-sm ${netFlow >= 0 ? 'bg-ink text-banky-yellow border-ink' : 'bg-white text-red-500 border-red-500'}`}>
                                    <span className="text-xs font-black uppercase tracking-widest mb-1 opacity-80">Net</span>
                                    <span className="text-2xl font-black font-mono">{netFlow >= 0 ? '+' : ''}{currency.symbol}{netFlow.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Sub-tabs for Tracker */}
                            <div className="flex justify-center">
                                <div className="inline-flex bg-white p-1.5 border-2 border-ink rounded-xl shadow-neo-sm">
                                    <button
                                        onClick={() => setTrackerSubTab('list')}
                                        className={`px-4 py-2 rounded-lg text-sm font-black uppercase transition-all ${trackerSubTab === 'list' ? 'bg-banky-yellow text-ink shadow-sm' : 'text-gray-400 hover:text-ink hover:bg-gray-50'}`}
                                    >
                                        History
                                    </button>
                                    <button
                                        onClick={() => setTrackerSubTab('analytics')}
                                        className={`px-4 py-2 rounded-lg text-sm font-black uppercase transition-all ${trackerSubTab === 'analytics' ? 'bg-banky-pink text-ink shadow-sm' : 'text-gray-400 hover:text-ink hover:bg-gray-50'}`}
                                    >
                                        Stats
                                    </button>
                                    <button
                                        onClick={() => setTrackerSubTab('calendar')}
                                        className={`px-4 py-2 rounded-lg text-sm font-black uppercase transition-all ${trackerSubTab === 'calendar' ? 'bg-banky-blue text-white shadow-sm' : 'text-gray-400 hover:text-ink hover:bg-gray-50'}`}
                                    >
                                        Calendar
                                    </button>
                                </div>
                            </div>

                            {/* Tracker Sub-Views */}
                            {trackerSubTab === 'list' && (
                                <div className="space-y-6 animate-fade-in">
                                    {/* AI Input */}
                                    <div className="bg-gray-50 p-6 border-2 border-ink dashed rounded-xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 bg-banky-pink text-white text-[10px] font-black px-2 py-1 border-l-2 border-b-2 border-ink uppercase">AI Powered</div>
                                        <h3 className="text-sm font-black uppercase text-gray-400 mb-3">Quick Add</h3>
                                        <form onSubmit={handleAiSubmit} className="flex flex-col md:flex-row gap-3">
                                            <input
                                                type="text"
                                                value={aiInput}
                                                onChange={(e) => setAiInput(e.target.value)}
                                                placeholder="e.g., 'Spent 20 on Pizza'..."
                                                className="flex-1 px-4 py-3 bg-white border-2 border-ink rounded-xl font-bold placeholder-gray-300 focus:outline-none focus:shadow-neo-sm transition-all"
                                                disabled={isAiLoading}
                                            />
                                            <button
                                                type="submit"
                                                disabled={isAiLoading}
                                                className="px-6 py-3 bg-ink text-white border-2 border-ink rounded-xl font-black uppercase hover:bg-banky-yellow hover:text-ink transition-all shadow-neo hover:shadow-neo-sm flex items-center justify-center gap-2"
                                            >
                                                {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                                <span>Add</span>
                                            </button>
                                        </form>
                                    </div>

                                    {/* Toolbar */}
                                    <div className="flex flex-wrap justify-between items-center gap-4">
                                        <div className="flex gap-2">
                                            {(['all', 'expense', 'income'] as const).map(f => (
                                                <button
                                                    key={f}
                                                    onClick={() => setListFilter(f)}
                                                    className={`px-3 py-1 rounded-lg text-xs font-black uppercase border-2 ${listFilter === f ? 'bg-ink text-white border-ink' : 'bg-white text-gray-400 border-gray-200 hover:border-ink'}`}
                                                >
                                                    {f}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setShowManualForm(!showManualForm)}
                                            className="text-xs font-black uppercase border-b-2 border-black hover:text-banky-purple"
                                        >
                                            {showManualForm ? 'Close Manual' : 'Manual Entry'}
                                        </button>
                                    </div>

                                    {/* Manual Form (Expanded) */}
                                    {showManualForm && (
                                        <form onSubmit={handleManualSubmit} className="bg-white border-2 border-ink p-6 rounded-xl shadow-neo space-y-4 animate-fade-in-up">
                                            <div className="flex gap-2 mb-4">
                                                <button type="button" onClick={() => handleTypeChange('expense')} className={`flex-1 py-2 rounded-lg font-black uppercase text-xs border-2 ${type === 'expense' ? 'bg-banky-pink text-ink border-ink' : 'border-transparent bg-gray-100 text-gray-400'}`}>Expense</button>
                                                <button type="button" onClick={() => handleTypeChange('income')} className={`flex-1 py-2 rounded-lg font-black uppercase text-xs border-2 ${type === 'income' ? 'bg-banky-green text-ink border-ink' : 'border-transparent bg-gray-100 text-gray-400'}`}>Income</button>
                                            </div>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400">{currency.symbol}</span>
                                                <input
                                                    type="number"
                                                    value={amount}
                                                    onChange={e => setAmount(e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full pl-8 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl font-bold focus:border-ink focus:outline-none transition-colors"
                                                    required
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                value={desc}
                                                onChange={e => setDesc(e.target.value)}
                                                placeholder="Description"
                                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl font-bold focus:border-ink focus:outline-none transition-colors"
                                                required
                                            />
                                            <button type="submit" className="w-full py-3 bg-ink text-white rounded-xl font-black uppercase hover:bg-gray-800 transition-colors">
                                                Confirm
                                            </button>
                                        </form>
                                    )}

                                    {/* Forecast Widget (AI Evolution) */}
                                    <div className="mb-6">
                                        <ForecastWidget />
                                    </div>

                                    {/* Transactions List */}
                                    <div className="space-y-3">
                                        {displayTransactions.length === 0 ? (
                                            <div className="text-center py-12 text-gray-400 font-bold italic border-2 border-dashed border-gray-200 rounded-xl">No transactions found.</div>
                                        ) : (
                                            displayTransactions.map(t => (
                                                <div key={t.id} className="group bg-white border-2 border-gray-100 hover:border-ink rounded-xl p-4 flex items-center justify-between transition-all hover:shadow-neo-sm">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-ink ${t.type === 'income' ? 'bg-banky-green' : 'bg-white'}`}>
                                                            <CategoryIcon category={t.category} className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-ink">{t.description}</p>
                                                            <p className="text-xs font-bold text-gray-400 uppercase">{new Date(t.date).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className={`font-mono font-black ${t.type === 'income' ? 'text-banky-green-darker' : 'text-ink'}`}>
                                                            {t.type === 'income' ? '+' : '-'}{currency.symbol}{t.amount.toFixed(2)}
                                                        </span>
                                                        <button onClick={() => deleteTransaction(t.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Analytics View */}
                            {trackerSubTab === 'analytics' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="h-64 bg-gray-50 rounded-xl border-2 border-gray-200 flex items-center justify-center">
                                        {dataByCategory.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={dataByCategory}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {dataByCategory.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <p className="font-bold text-gray-400">No data yet.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Calendar View */}
                            {trackerSubTab === 'calendar' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-black uppercase">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                                        <div className="flex gap-2">
                                            <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft /></button>
                                            <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded"><ChevronRight /></button>
                                        </div>
                                    </div>
                                    <div className="border-2 border-ink rounded-xl overflow-hidden shadow-neo-sm">
                                        <div className="grid grid-cols-7 bg-gray-100 border-b-2 border-ink">
                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="p-2 text-center text-xs font-black text-gray-500">{d}</div>)}
                                        </div>
                                        <div className="grid grid-cols-7 bg-white">
                                            {renderCalendar()}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'dreamboard' && <DreamBoard />}
                {activeTab === 'bills' && <BillSplitter />}
            </div>

            {/* Modals */}
            {
                showWidgetLibrary && (
                    <WidgetLibrary onClose={() => setShowWidgetLibrary(false)} />
                )
            }

            {
                showVoiceInput && (
                    <VoiceInput
                        onClose={() => setShowVoiceInput(false)}
                        defaultAccountId={accounts[0]?.id}
                    />
                )
            }

            {
                showReceiptScanner && (
                    <ReceiptScanner
                        onClose={() => setShowReceiptScanner(false)}
                        defaultAccountId={accounts[0]?.id}
                    />
                )
            }
        </div >
    );
};

export default Dashboard;
