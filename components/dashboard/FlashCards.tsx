import React, { useState } from 'react';
import { Zap, TrendingUp, Mic, Camera } from 'lucide-react';
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
 * Extracted from Dashboard for better maintainability.
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
        <div className="bg-white border-4 border-ink shadow-neo overflow-hidden h-full">
            {/* Tabs */}
            <div className="flex border-b-4 border-ink">
                <button
                    onClick={() => setQuickAddTab('spend')}
                    className={`flex-1 py-4 font-black uppercase flex items-center justify-center gap-2 transition-colors ${quickAddTab === 'spend'
                        ? 'bg-banky-pink text-white'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                >
                    <Zap className="w-5 h-5" /> Flash Spend
                </button>
                <button
                    onClick={() => setQuickAddTab('earn')}
                    className={`flex-1 py-4 font-black uppercase flex items-center justify-center gap-2 transition-colors ${quickAddTab === 'earn'
                        ? 'bg-banky-green text-ink'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                >
                    <TrendingUp className="w-5 h-5" /> Flash Earn
                </button>
            </div>

            {/* Forms */}
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
                        <div>
                            <label className="block text-xs font-black uppercase mb-1 text-gray-500">Wallet</label>
                            <select
                                value={flashSpendWalletId || (accounts[0]?.id || '')}
                                onChange={(e) => setFlashSpendWalletId(e.target.value)}
                                className="w-full border-2 border-ink p-3 font-bold outline-none focus:shadow-neo-sm transition-shadow bg-white"
                            >
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.name} ({currencySymbol}{acc.balance.toFixed(2)})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 bg-ink text-white p-3 border-2 border-transparent hover:bg-banky-pink hover:border-ink hover:text-white font-black uppercase transition-all shadow-neo hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                            >
                                Blast It!
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowVoiceInput(true)}
                                className="w-12 bg-gradient-to-br from-banky-purple to-banky-pink text-white p-3 border-2 border-ink font-black transition-all shadow-neo hover:shadow-none hover:translate-x-1 hover:translate-y-1 flex items-center justify-center"
                                title="Voice Input"
                            >
                                <Mic className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowReceiptScanner(true)}
                                className="w-12 bg-gradient-to-br from-banky-green to-banky-blue text-ink p-3 border-2 border-ink font-black transition-all shadow-neo hover:shadow-none hover:translate-x-1 hover:translate-y-1 flex items-center justify-center"
                                title="Scan Receipt"
                            >
                                <Camera className="w-5 h-5" />
                            </button>
                        </div>
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
                                    <option value="Investment">Investment Returns</option>
                                    <option value="Gift">Gift</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase mb-1 text-gray-500">Wallet</label>
                            <select
                                value={flashEarnWalletId || (accounts[0]?.id || '')}
                                onChange={(e) => setFlashEarnWalletId(e.target.value)}
                                className="w-full border-2 border-ink p-3 font-bold outline-none focus:shadow-neo-sm transition-shadow bg-white"
                            >
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.name} ({currencySymbol}{acc.balance.toFixed(2)})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 bg-ink text-white p-3 border-2 border-transparent hover:bg-banky-green hover:border-ink hover:text-ink font-black uppercase transition-all shadow-neo hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                            >
                                Secure It!
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowVoiceInput(true)}
                                className="w-12 bg-gradient-to-br from-banky-purple to-banky-pink text-white p-3 border-2 border-ink font-black transition-all shadow-neo hover:shadow-none hover:translate-x-1 hover:translate-y-1 flex items-center justify-center"
                                title="Voice Input"
                            >
                                <Mic className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Voice Input Modal */}
            {showVoiceInput && (
                <VoiceInput
                    onClose={() => setShowVoiceInput(false)}
                    defaultAccountId={quickAddTab === 'spend' ? flashSpendWalletId || accounts[0]?.id : flashEarnWalletId || accounts[0]?.id}
                />
            )}

            {/* Receipt Scanner Modal */}
            {showReceiptScanner && (
                <ReceiptScanner
                    onClose={() => setShowReceiptScanner(false)}
                    defaultAccountId={quickAddTab === 'spend' ? flashSpendWalletId || accounts[0]?.id : flashEarnWalletId || accounts[0]?.id}
                />
            )}
        </div>
    );
};

export default FlashCards;
