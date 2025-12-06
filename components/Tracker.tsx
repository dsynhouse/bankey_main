
import React, { useState } from 'react';
import { useBanky } from '../context/useBanky';
import { parseTransactionInput } from '../services/geminiService';
import { Category, Transaction } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Plus, Loader2, Sparkles, Filter, ArrowUpRight, ArrowDownRight, RotateCcw, Wallet, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Trash2, ArrowUpDown, Mic, Camera } from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { PremiumUpgradeCTA } from './PremiumUpgradeCTA';
import VoiceInput from './VoiceInput';
import ReceiptScanner from './ReceiptScanner';


const Tracker: React.FC = () => {
  const { transactions, addTransaction, deleteTransaction, accounts, currency } = useBanky();
  const [activeTab, setActiveTab] = useState<'list' | 'analytics' | 'calendar'>('list');

  // AI Input State
  const [aiInput, setAiInput] = useState('');
  const [aiAccountId, setAiAccountId] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [showManualForm, setShowManualForm] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);

  // New State for Filters
  const [listFilter, setListFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [analyticsView, setAnalyticsView] = useState<'expense' | 'income'>('expense');

  // New State for Sorting
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateLog, setSelectedDateLog] = useState<Transaction[] | null>(null);

  // Manual Form State
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState<Category>(Category.FOOD);
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  const handleTypeChange = (newType: 'expense' | 'income') => {
    setType(newType);
    if (newType === 'income') {
      setCategory(Category.INCOME);
    } else {
      setCategory(Category.FOOD);
    }
  };



  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const targetAccountId = aiAccountId || (accounts.length > 0 ? accounts[0].id : '');
    if (!targetAccountId && accounts.length > 0) {
      // Should theoretically be covered by useEffect, but safety check
      setAiAccountId(accounts[0].id);
    }

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
      alert("Oops! My bad. Try saying 'Spent 20 on Pizza'.");
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

  const resetFilters = () => {
    setListFilter('all');
    setAnalyticsView('expense');
    setSortBy('date');
    setSortOrder('desc');
  };

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc'); // Default to descending when switching
    }
  };

  // --- CALENDAR LOGIC ---
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
    setSelectedDateLog(null);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty slots for prev month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50/50 border border-gray-100"></div>);
    }

    // Days
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
        <div
          key={day}
          onClick={() => setSelectedDateLog(dayTransactions)}
          className={`h-24 border border-ink p-2 relative cursor-pointer transition-colors ${bgClass}`}
        >
          <span className="font-bold text-xs absolute top-2 left-2">{day}</span>
          {hasActivity && (
            <div className="absolute bottom-2 right-2 text-xs font-black">
              {dayTransactions.length} Log{dayTransactions.length > 1 ? 's' : ''}
            </div>
          )}
          {hasActivity && (
            <div className="flex flex-col items-end mt-4 gap-0.5">
              {dailyIncome > 0 && <span className="text-[10px] text-banky-green font-black">+{currency.symbol}{dailyIncome}</span>}
              {dailyExpense > 0 && <span className="text-[10px] text-red-500 font-black">-{currency.symbol}{dailyExpense}</span>}
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  // Filter & Sort Transactions for List View
  const displayTransactions = transactions.filter(t => {
    if (listFilter === 'all') return true;
    return t.type === listFilter;
  }).sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'asc'
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    }
  });

  // Calculate Totals for Summary
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netFlow = totalIncome - totalExpense;

  // Chart Data
  const dataByCategory = Object.values(Category).map(cat => {
    const total = transactions
      .filter(t => t.category === cat && t.type === analyticsView)
      .reduce((sum, t) => sum + t.amount, 0);
    return { name: cat, value: total };
  }).filter(d => d.value > 0);

  const COLORS = ['#DEFF00', '#FF88DC', '#54C7EC', '#00E08F', '#A688FA', '#FF9F1C', '#EF4444', '#121212'];

  const incomeCategories = [Category.INCOME, Category.BUSINESS, Category.INVESTMENT, Category.OTHER];
  const expenseCategories = Object.values(Category).filter(c => c !== Category.INCOME);
  const availableCategories = type === 'income' ? incomeCategories : expenseCategories;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-ink pb-4">
        <div>
          <h1 className="text-5xl font-black text-ink uppercase tracking-tighter italic font-display">The Drip Check</h1>
          <p className="text-gray-500 font-bold">Math ain't mathing? Check the receipts.</p>
        </div>

        <div className="flex items-center gap-3">
          {(listFilter !== 'all' || analyticsView !== 'expense' || sortBy !== 'date' || sortOrder !== 'desc') && activeTab === 'list' && (
            <button
              onClick={resetFilters}
              className="bg-white border-2 border-ink p-2 shadow-neo-sm hover:translate-y-0.5 hover:shadow-none transition-all group animate-fade-in"
              title="Reset All Filters"
            >
              <RotateCcw className="w-5 h-5 text-gray-500 group-hover:text-ink transition-colors" />
            </button>
          )}

          <div className="flex bg-white border-2 border-ink p-1 shadow-neo-sm">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 md:px-6 py-2 text-sm font-black uppercase transition-all border-2 font-display ${activeTab === 'list' ? 'bg-banky-yellow border-ink shadow-neo-sm -translate-y-1' : 'border-transparent text-gray-400 hover:text-ink'}`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 md:px-6 py-2 text-sm font-black uppercase transition-all border-2 font-display ${activeTab === 'analytics' ? 'bg-banky-pink border-ink shadow-neo-sm -translate-y-1' : 'border-transparent text-gray-400 hover:text-ink'}`}
            >
              Stats
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 md:px-6 py-2 text-sm font-black uppercase transition-all border-2 font-display ${activeTab === 'calendar' ? 'bg-banky-blue border-ink shadow-neo-sm -translate-y-1' : 'border-transparent text-gray-400 hover:text-ink'}`}
            >
              Calendar
            </button>
          </div>
        </div>
      </div>

      {/* AI Input Section */}
      <div className="bg-ink p-1 rounded-sm shadow-neo">
        <div className="bg-white border-2 border-ink p-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="bg-banky-green border-2 border-ink p-3 shadow-neo-sm hidden md:block rotate-3">
            <Sparkles className="w-8 h-8 text-ink" />
          </div>
          <div className="flex-1 w-full">
            <h2 className="text-xl font-black mb-2 uppercase flex items-center gap-2 font-display">
              Lazy Add <span className="text-xs bg-banky-pink px-2 py-0.5 border border-ink text-white transform -rotate-2">AI Powered</span>
            </h2>
            <form onSubmit={handleAiSubmit} className="flex flex-col md:flex-row gap-2 w-full">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="e.g., 'Dropped 15 on boba' or 'Got 500 from freelance'"
                className="flex-1 px-4 py-3 bg-ink border-2 border-ink text-white font-mono focus:outline-none focus:ring-0 focus:shadow-neo-sm transition-shadow placeholder-gray-500"
                disabled={isAiLoading}
              />
              <select
                value={aiAccountId || (accounts.length > 0 ? accounts[0].id : '')}
                onChange={(e) => setAiAccountId(e.target.value)}
                className="md:w-48 px-4 py-3 bg-ink border-2 border-ink text-white font-bold focus:outline-none focus:shadow-neo-sm"
              >
                {accounts.length === 0 && <option value="">Main Wallet</option>}
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={isAiLoading}
                className="px-6 py-3 bg-banky-yellow border-2 border-ink text-ink font-black hover:shadow-neo-sm hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center gap-2 font-display"
              >
                {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ADD'}
              </button>
              <button
                type="button"
                onClick={() => setShowVoiceInput(true)}
                className="px-4 py-3 bg-gradient-to-br from-banky-purple to-banky-pink text-white border-2 border-ink font-black hover:shadow-neo-sm hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center"
                title="Voice Input"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptScanner(true)}
                className="px-4 py-3 bg-gradient-to-br from-banky-green to-banky-blue text-ink border-2 border-ink font-black hover:shadow-neo-sm hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center"
                title="Scan Receipt"
              >
                <Camera className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          {/* Summary Stats for Tracker */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-banky-green/10 border-2 border-banky-green p-4 flex flex-col items-center justify-center text-center shadow-sm">
              <span className="text-[10px] md:text-xs font-black uppercase text-banky-green-darker tracking-widest mb-1 font-display">Total In</span>
              <span className="text-lg md:text-xl font-black text-banky-green-darker break-all font-mono">+{currency.symbol}{totalIncome.toLocaleString()}</span>
            </div>
            <div className="bg-red-50 border-2 border-red-200 p-4 flex flex-col items-center justify-center text-center shadow-sm">
              <span className="text-[10px] md:text-xs font-black uppercase text-red-400 tracking-widest mb-1 font-display">Total Out</span>
              <span className="text-lg md:text-xl font-black text-red-500 break-all font-mono">-{currency.symbol}{totalExpense.toLocaleString()}</span>
            </div>
            <div className={`border-2 p-4 flex flex-col items-center justify-center text-center shadow-sm ${netFlow >= 0 ? 'bg-ink text-banky-yellow border-ink' : 'bg-white text-red-500 border-red-500'}`}>
              <span className="text-[10px] md:text-xs font-black uppercase tracking-widest mb-1 opacity-80 font-display">Net Flow</span>
              <span className="text-lg md:text-xl font-black break-all font-mono">{netFlow >= 0 ? '+' : ''}{currency.symbol}{netFlow.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Type Filter */}
              <div className="flex items-center gap-2 bg-white border-2 border-ink p-1 shadow-neo-sm">
                <Filter className="w-4 h-4 ml-2 text-gray-500" />
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                {(['all', 'expense', 'income'] as const).map((ft) => (
                  <button
                    key={ft}
                    onClick={() => setListFilter(ft)}
                    className={`px-3 py-1 text-xs font-black uppercase transition-all font-display ${listFilter === ft
                      ? 'bg-ink text-white shadow-sm'
                      : 'text-gray-400 hover:text-ink'
                      }`}
                  >
                    {ft === 'all' ? 'Everything' : ft === 'expense' ? 'The Ls' : 'The Ws'}
                  </button>
                ))}
              </div>

              {/* Sort Controls */}
              <div className="flex items-center gap-2 bg-white border-2 border-ink p-1 shadow-neo-sm">
                <ArrowUpDown className="w-4 h-4 ml-2 text-gray-500" />
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <button
                  onClick={() => toggleSort('date')}
                  className={`px-3 py-1 text-xs font-black uppercase transition-all font-display flex items-center gap-1 ${sortBy === 'date' ? 'bg-ink text-white shadow-sm' : 'text-gray-400 hover:text-ink'
                    }`}
                >
                  Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => toggleSort('amount')}
                  className={`px-3 py-1 text-xs font-black uppercase transition-all font-display flex items-center gap-1 ${sortBy === 'amount' ? 'bg-ink text-white shadow-sm' : 'text-gray-400 hover:text-ink'
                    }`}
                >
                  Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowManualForm(!showManualForm)}
              className="flex items-center gap-2 text-sm font-bold text-ink bg-white border-2 border-ink px-4 py-2 hover:bg-gray-100 transition-colors shadow-neo-sm font-display uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" /> MANUAL ENTRY
            </button>
          </div>

          {showManualForm && (
            <form onSubmit={handleManualSubmit} className="bg-banky-blue/20 p-6 border-2 border-ink shadow-neo grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up relative">
              <div className="absolute top-0 left-0 bg-white border-b-2 border-r-2 border-ink px-3 py-1 text-xs font-black uppercase font-display">
                New Transaction
              </div>
              {accounts.length === 0 && (
                <div className="md:col-span-2 bg-banky-yellow/50 border-2 border-ink text-ink p-3 font-bold text-sm flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  No wallets found. We'll create a default one for you.
                </div>
              )}

              <div className="md:col-span-2 mt-4">
                <label className="block text-xs font-black text-ink mb-1 uppercase font-display">Flow Type</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleTypeChange('expense')} className={`flex-1 py-3 border-2 border-ink font-black uppercase transition-all font-display ${type === 'expense' ? 'bg-banky-pink text-white shadow-neo-sm' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>Spent It (Out)</button>
                  <button type="button" onClick={() => handleTypeChange('income')} className={`flex-1 py-3 border-2 border-ink font-black uppercase transition-all font-display ${type === 'income' ? 'bg-banky-green text-ink shadow-neo-sm' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>Earned It (In)</button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-ink mb-1 uppercase font-display">What was it?</label>
                <input required value={desc} onChange={e => setDesc(e.target.value)} className="w-full border-2 border-ink bg-ink text-white p-3 font-bold focus:shadow-neo-sm outline-none placeholder-gray-500" placeholder={type === 'expense' ? "e.g. Vintage Tee" : "e.g. Salary"} />
              </div>
              <div>
                <label className="block text-xs font-black text-ink mb-1 uppercase font-display">How much?</label>
                <input required type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border-2 border-ink bg-ink text-white p-3 font-bold focus:shadow-neo-sm outline-none placeholder-gray-500" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs font-black text-ink mb-1 uppercase font-display">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value as Category)} className="w-full border-2 border-ink bg-ink text-white p-3 font-bold focus:shadow-neo-sm outline-none">
                  {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-ink mb-1 uppercase font-display">
                  {type === 'income' ? 'Deposit To' : 'Paid From'}
                </label>
                <select
                  value={selectedAccountId || (accounts.length > 0 ? accounts[0].id : '')}
                  onChange={e => setSelectedAccountId(e.target.value)}
                  className="w-full border-2 border-ink bg-ink text-white p-3 font-bold focus:shadow-neo-sm outline-none"
                >
                  <option value="" disabled>Select Wallet...</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({currency.symbol}{acc.balance})</option>
                  ))}
                  {accounts.length === 0 && <option value="" disabled>Main Wallet (Default)</option>}
                </select>
              </div>

              <button type="submit" className="md:col-span-2 bg-ink text-white border-2 border-ink font-black py-4 mt-2 hover:bg-gray-900 shadow-neo hover:-translate-y-1 transition-all uppercase tracking-wider font-display disabled:opacity-50 disabled:cursor-not-allowed">
                {type === 'income' ? 'Add Income' : 'Log Expense'}
              </button>
            </form>
          )}

          <div className="bg-white border-2 border-ink shadow-neo overflow-hidden">
            {displayTransactions.length === 0 ? (
              <div className="p-10 text-center text-gray-400 font-mono">
                [ No {listFilter !== 'all' ? listFilter : ''} records found. ]
              </div>
            ) : (
              <div className="divide-y-2 divide-ink">
                {displayTransactions.map(t => (
                  <div
                    key={t.id}
                    className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors group relative overflow-hidden ${t.type === 'income' ? 'bg-banky-green/10 hover:bg-banky-green/20' : 'bg-white hover:bg-gray-50'
                      }`}
                  >
                    {t.type === 'income' && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-banky-green border-r border-ink"></div>}
                    <div className={`flex items-center gap-4 min-w-0 ${t.type === 'income' ? 'pl-2' : ''}`}>
                      <div className={`w-12 h-12 flex-shrink-0 border-2 border-ink shadow-neo-sm flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform ${t.type === 'income' ? 'bg-banky-green text-ink' : 'bg-paper text-ink'
                        }`}>
                        <CategoryIcon category={t.category} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-ink text-lg font-sans flex items-center gap-2 truncate">
                          <span className="truncate">{t.description}</span>
                          {t.type === 'income' && <ArrowDownRight className="w-4 h-4 text-banky-green flex-shrink-0" />}
                          {t.type === 'expense' && <ArrowUpRight className="w-4 h-4 text-red-400 flex-shrink-0" />}
                        </p>
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-gray-500 uppercase">
                          <span>{new Date(t.date).toLocaleDateString()}</span>
                          <span>/</span>
                          <span className={t.type === 'income' ? 'text-banky-green-darker' : ''}>{t.category}</span>
                          <span className="text-gray-400 ml-1">• {accounts.find(a => a.id === t.accountId)?.name || 'Wallet'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pl-[4rem] sm:pl-0">
                      <span className={`font-black text-xl font-mono border-2 border-transparent px-2 py-1 ${t.type === 'income' ? 'bg-ink text-banky-green border-ink shadow-sm' : 'text-ink'
                        }`}>
                        {t.type === 'income' ? '+' : '-'}{currency.symbol}{t.amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="p-2 bg-white border-2 border-ink shadow-sm hover:shadow-neo-sm hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fade-in">
          <div className="flex justify-center">
            <div className="flex bg-white border-2 border-ink p-1 shadow-neo-sm">
              <button
                onClick={() => setAnalyticsView('expense')}
                className={`px-6 py-2 text-sm font-black uppercase transition-all font-display ${analyticsView === 'expense'
                  ? 'bg-banky-pink border-2 border-ink shadow-neo-sm -translate-y-1'
                  : 'border-2 border-transparent text-gray-400 hover:text-ink'
                  }`}
              >
                Expenses
              </button>
              <button
                onClick={() => setAnalyticsView('income')}
                className={`px-6 py-2 text-sm font-black uppercase transition-all font-display ${analyticsView === 'income'
                  ? 'bg-banky-green border-2 border-ink shadow-neo-sm -translate-y-1'
                  : 'border-2 border-transparent text-gray-400 hover:text-ink'
                  }`}
              >
                Income
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 border-2 border-ink shadow-neo h-[400px] flex flex-col">
              <h3 className="text-xl font-black text-ink mb-6 uppercase border-b-2 border-ink pb-2 font-display">
                {analyticsView} Breakdown
              </h3>
              <div className="flex-1">
                {dataByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dataByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="#121212"
                        strokeWidth={2}
                      >
                        {dataByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ border: '2px solid #121212', borderRadius: '0px', boxShadow: '4px 4px 0px 0px #121212', fontWeight: 'bold' }}
                        formatter={(value: number) => `${currency.symbol}${value}`}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 font-bold font-mono">
                    No data. Zero. Nada.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-black text-ink uppercase font-display">Top Categories</h3>
              {dataByCategory.length > 0 ? (
                dataByCategory.sort((a, b) => b.value - a.value).map((cat, idx) => (
                  <div key={cat.name} className="bg-white p-4 border-2 border-ink shadow-neo-sm flex items-center justify-between hover:translate-x-1 transition-transform">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-ink" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <span className="font-bold text-ink uppercase tracking-wide font-display">{cat.name}</span>
                    </div>
                    <span className="font-mono font-black text-ink text-lg">{currency.symbol}{cat.value.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-gray-100 border-2 border-dashed border-gray-300 text-center text-gray-400 font-bold">
                  Stop lurking and start tracking!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between bg-white border-2 border-ink p-4 shadow-neo-sm">
            <h2 className="text-2xl font-black uppercase font-display flex items-center gap-2">
              <CalendarIcon className="w-6 h-6" /> {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button onClick={() => changeMonth(-1)} className="p-2 border-2 border-ink hover:bg-gray-100"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => changeMonth(1)} className="p-2 border-2 border-ink hover:bg-gray-100"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="bg-white border-2 border-ink shadow-neo">
            <div className="grid grid-cols-7 border-b-2 border-ink bg-gray-100">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center font-black uppercase text-xs text-gray-500">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {renderCalendar()}
            </div>
          </div>

          {selectedDateLog && (
            <div className="bg-white border-2 border-ink shadow-neo p-6 animate-fade-in-up">
              <h3 className="text-xl font-black uppercase mb-4 border-b-2 border-ink pb-2 font-display">Daily Log</h3>
              {selectedDateLog.length === 0 ? (
                <p className="text-gray-400 font-bold italic">No activity on this day.</p>
              ) : (
                <div className="space-y-2">
                  {selectedDateLog.map(t => (
                    <div key={t.id} className="flex justify-between items-center p-2 border-b border-gray-100 group">
                      <div className="flex items-center gap-2">
                        <CategoryIcon category={t.category} className="w-4 h-4" />
                        <span className="font-bold">{t.description}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-mono font-black ${t.type === 'income' ? 'text-banky-green' : 'text-ink'}`}>
                          {t.type === 'income' ? '+' : '-'}{currency.symbol}{t.amount}
                        </span>
                        <button
                          onClick={() => deleteTransaction(t.id)}
                          className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Premium CTA */}
      <PremiumUpgradeCTA variant="floating" context="tracker" />

      {/* Voice Input Modal (for inline button) */}
      {showVoiceInput && (
        <VoiceInput
          onClose={() => setShowVoiceInput(false)}
          defaultAccountId={aiAccountId || accounts[0]?.id}
        />
      )}

      {/* Receipt Scanner Modal (for inline button) */}
      {showReceiptScanner && (
        <ReceiptScanner
          onClose={() => setShowReceiptScanner(false)}
          defaultAccountId={aiAccountId || accounts[0]?.id}
        />
      )}
    </div>
  );
};

export default Tracker;
