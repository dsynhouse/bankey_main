import React, { useState } from 'react';
import { Zap, TrendingUp, Mic, Camera, ArrowRight, Wallet, Tag } from 'lucide-react';
import { Account, Category, Currency, Transaction } from '../../types';
import VoiceInput from '../VoiceInput';
import ReceiptScanner from '../ReceiptScanner';

interface FlashCardsProps {
    accounts: Account[];
    currency: Currency;
    addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>;
}

/**
 * FlashCards component handles quick spend/earn transaction entry.
 * Redesigned for spaciousness and better visual hierarchy.
 */
const FlashCards: React.FC<FlashCardsProps> = ({ accounts, currency, addTransaction }) => {
    const [quickAddTab, setQuickAddTab] = useState<'spend' | 'earn'>('spend');

    // Flash Spend State
    const [flashSpendAmount, setFlashSpendAmount] = useState('');
    const [flashSpendCategory, setFlashSpendCategory] = useState('Food');
    const [flashSpendWalletId, setFlashSpendWalletId] = useState('');

    // Flash Earn State
    const [flashEarnAmount, setFlashEarnAmount] = useState('');
    const [flashEarnSource, setFlashEarnSource] = useState('Salary');
    const [flashEarnWalletId, setFlashEarnWalletId] = useState('');

    // Voice Input State
    const [showVoiceInput, setShowVoiceInput] = useState(false);

    // Receipt Scanner State
    const [showReceiptScanner, setShowReceiptScanner] = useState(false);

    const currencySymbol = currency.symbol;

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
            category: flashSpendCategory as Category,
            description: flashSpendCategory,
            accountId: flashSpendWalletId || accounts[0].id,
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
            accountId: flashEarnWalletId || accounts[0].id,
            type: 'income'
        });

        setFlashEarnAmount('');
        setFlashEarnSource('Salary');
    };

    return (
        <div className="bg-white border-4 border-ink shadow-neo h-full flex flex-col">
            {/* Header with Segmented Control */}
            <div className="p-6 md:p-8 border-b-4 border-ink bg-gray-50/50">
                <div className="flex bg-white p-1.5 border-2 border-ink rounded-xl shadow-neo-sm max-w-md mx-auto relative">
                    {/* Animated pill background could be added here for extra polish */}
                    <button
                        onClick={() => setQuickAddTab('spend')}
                        className={`flex-1 py-3 px-4 rounded-lg font-black uppercase text-sm flex items-center justify-center gap-2 transition-all ${quickAddTab === 'spend'
                            ? 'bg-banky-pink text-ink shadow-sm transform scale-105'
                            : 'text-gray-400 hover:text-ink hover:bg-gray-50'
                            }`}
                    >
                        <Zap className="w-4 h-4 ml-[-4px]" />
                        <span>Spend</span>
                    </button>
                    <button
                        onClick={() => setQuickAddTab('earn')}
                        className={`flex-1 py-3 px-4 rounded-lg font-black uppercase text-sm flex items-center justify-center gap-2 transition-all ${quickAddTab === 'earn'
                            ? 'bg-banky-green text-ink shadow-sm transform scale-105'
                            : 'text-gray-400 hover:text-ink hover:bg-gray-50'
                            }`}
                    >
                        <TrendingUp className="w-4 h-4 ml-[-4px]" />
                        <span>Earn</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                {quickAddTab === 'spend' ? (
                    <form onSubmit={handleFlashSpend} className="p-6 md:p-8 space-y-8 flex-1 flex flex-col">
                        {/* Hero Amount Input */}
                        <div className="text-center relative">
                            <label className="block text-xs font-black uppercase text-ink/40 mb-2 tracking-widest">Amount</label>
                            <div className="flex items-center justify-center gap-1">
                                <span className="text-4xl text-ink/40 font-black mb-2">
                                    {currencySymbol}
                                </span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={flashSpendAmount}
                                    onChange={(e) => setFlashSpendAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="text-left text-5xl md:text-6xl font-black text-ink bg-transparent placeholder-gray-200 focus:outline-none min-w-[3ch]"
                                    style={{ width: `${Math.max(3, flashSpendAmount.length)}ch` }}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Grid Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div className="bg-gray-50 p-4 border-2 border-ink shadow-neo-sm rounded-xl hover:shadow-neo transition-all group focus-within:ring-2 focus-within:ring-banky-pink">
                                <label className="flex items-center gap-2 text-xs font-black uppercase text-ink/50 mb-2">
                                    <Tag className="w-3 h-3" /> Category
                                </label>
                                <select
                                    value={flashSpendCategory}
                                    onChange={(e) => setFlashSpendCategory(e.target.value)}
                                    className="w-full bg-transparent font-bold text-lg md:text-xl appearance-none cursor-pointer focus:outline-none text-ink truncate"
                                >
                                    <option>Food</option>
                                    <option>Transport</option>
                                    <option>Shopping</option>
                                    <option>Entertainment</option>
                                    <option>Bills</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div className="bg-gray-50 p-4 border-2 border-ink shadow-neo-sm rounded-xl hover:shadow-neo transition-all group focus-within:ring-2 focus-within:ring-banky-pink">
                                <label className="flex items-center gap-2 text-xs font-black uppercase text-ink/50 mb-2">
                                    <Wallet className="w-3 h-3" /> Wallet
                                </label>
                                <select
                                    value={flashSpendWalletId || (accounts[0]?.id || '')}
                                    onChange={(e) => setFlashSpendWalletId(e.target.value)}
                                    className="w-full bg-transparent font-bold text-lg md:text-xl appearance-none cursor-pointer focus:outline-none text-ink truncate"
                                >
                                    {accounts.map((acc) => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.name} ({currencySymbol}{acc.balance.toFixed(2)})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>



                        {/* Action Buttons */}
                        <div className="flex flex-col md:flex-row gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={!flashSpendAmount}
                                className="flex-[2] bg-ink text-white border-2 border-ink rounded-xl px-6 py-4 shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all font-black uppercase text-base md:text-lg flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                <span>Blast It!</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="flex gap-3 flex-1">
                                <button
                                    type="button"
                                    onClick={() => setShowVoiceInput(true)}
                                    className="flex-1 bg-white border-2 border-ink rounded-xl shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all flex items-center justify-center p-3 group text-banky-purple"
                                    title="Voice Input"
                                >
                                    <Mic className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowReceiptScanner(true)}
                                    className="flex-1 bg-white border-2 border-ink rounded-xl shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all flex items-center justify-center p-3 group text-banky-green"
                                    title="Scan Receipt"
                                >
                                    <Camera className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleFlashEarn} className="p-6 md:p-8 space-y-8 flex-1 flex flex-col">
                        {/* Hero Amount Input */}
                        <div className="text-center relative">
                            <label className="block text-xs font-black uppercase text-ink/40 mb-2 tracking-widest">Amount</label>
                            <div className="flex items-center justify-center gap-1">
                                <span className="text-4xl text-ink/40 font-black mb-2">
                                    {currencySymbol}
                                </span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={flashEarnAmount}
                                    onChange={(e) => setFlashEarnAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="text-left text-5xl md:text-6xl font-black text-ink bg-transparent placeholder-gray-200 focus:outline-none min-w-[3ch]"
                                    style={{ width: `${Math.max(3, flashEarnAmount.length)}ch` }}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Grid Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div className="bg-gray-50 p-4 border-2 border-ink shadow-neo-sm rounded-xl hover:shadow-neo transition-all group focus-within:ring-2 focus-within:ring-banky-green">
                                <label className="flex items-center gap-2 text-xs font-black uppercase text-ink/50 mb-2">
                                    <Tag className="w-3 h-3" /> Source
                                </label>
                                <select
                                    value={flashEarnSource}
                                    onChange={(e) => setFlashEarnSource(e.target.value)}
                                    className="w-full bg-transparent font-bold text-lg md:text-xl appearance-none cursor-pointer focus:outline-none text-ink truncate"
                                >
                                    <option>Salary</option>
                                    <option>Freelance</option>
                                    <option>Investment</option>
                                    <option>Gift</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div className="bg-gray-50 p-4 border-2 border-ink shadow-neo-sm rounded-xl hover:shadow-neo transition-all group focus-within:ring-2 focus-within:ring-banky-green">
                                <label className="flex items-center gap-2 text-xs font-black uppercase text-ink/50 mb-2">
                                    <Wallet className="w-3 h-3" /> Wallet
                                </label>
                                <select
                                    value={flashEarnWalletId || (accounts[0]?.id || '')}
                                    onChange={(e) => setFlashEarnWalletId(e.target.value)}
                                    className="w-full bg-transparent font-bold text-lg md:text-xl appearance-none cursor-pointer focus:outline-none text-ink truncate"
                                >
                                    {accounts.map((acc) => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.name} ({currencySymbol}{acc.balance.toFixed(2)})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>



                        {/* Action Buttons */}
                        <div className="flex flex-col md:flex-row gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={!flashEarnAmount}
                                className="flex-[2] bg-banky-green text-ink border-2 border-ink rounded-xl px-6 py-4 shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all font-black uppercase text-base md:text-lg flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                <span>Income!</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="flex gap-3 flex-1">
                                <button
                                    type="button"
                                    onClick={() => setShowVoiceInput(true)}
                                    className="flex-1 bg-white border-2 border-ink rounded-xl shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all flex items-center justify-center p-3 group text-banky-purple"
                                    title="Voice Input"
                                >
                                    <Mic className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowReceiptScanner(true)}
                                    className="flex-1 bg-white border-2 border-ink rounded-xl shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all flex items-center justify-center p-3 group text-banky-green"
                                    title="Scan Receipt"
                                >
                                    <Camera className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>

            {/* Modals */}
            {showVoiceInput && (
                <VoiceInput
                    onClose={() => setShowVoiceInput(false)}
                    defaultAccountId={accounts[0]?.id}
                />
            )}

            {showReceiptScanner && (
                <ReceiptScanner
                    onClose={() => setShowReceiptScanner(false)}
                    defaultAccountId={accounts[0]?.id}
                />
            )}
        </div>
    );
};

export default FlashCards;
