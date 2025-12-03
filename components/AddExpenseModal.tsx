import React, { useState } from 'react';
import { Member, Expense, SplitDetail } from '../types';
import { calculateSplits } from '../services/billSplitterService';
import { X, DollarSign, Users, Check } from 'lucide-react';

interface AddExpenseModalProps {
    members: Member[];
    onClose: () => void;
    onAdd: (expense: Omit<Expense, 'id'>) => void;
    currencySymbol: string;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ members, onClose, onAdd, currencySymbol }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState(members[0]?.id || '');
    const [splitMethod, setSplitMethod] = useState<'equal' | 'percentage'>('equal');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !paidBy) return;

        const numAmount = parseFloat(amount);
        if (numAmount <= 0) {
            alert("Amount must be positive!");
            return;
        }

        // Calculate splits
        const memberIds = members.map(m => m.id);
        const splitDetails = calculateSplits(numAmount, memberIds, splitMethod);

        onAdd({
            description,
            amount: numAmount,
            paidBy,
            date: new Date().toISOString(),
            splitDetails,
            splitMethod
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white border-4 border-ink shadow-neo-lg w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-2 right-2 p-2 hover:bg-gray-100 border-2 border-transparent hover:border-ink transition-all">
                    <X className="w-6 h-6 text-ink" />
                </button>

                <div className="bg-banky-yellow border-b-4 border-ink p-6">
                    <h2 className="text-2xl font-black uppercase font-display text-ink flex items-center gap-2">
                        <DollarSign className="w-6 h-6" /> Add Expense
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Amount & Description */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black uppercase mb-1 text-gray-500 font-display">Description</label>
                            <input
                                autoFocus
                                type="text"
                                placeholder="e.g. Dinner, Uber, Rent"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full border-2 border-ink p-3 font-bold text-lg outline-none focus:shadow-neo-sm transition-shadow bg-white text-ink placeholder-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase mb-1 text-gray-500 font-display">Amount</label>
                            <div className="flex items-center border-b-4 border-ink bg-ink p-2 focus-within:border-banky-green transition-colors">
                                <span className="text-2xl font-black text-white mr-2">{currencySymbol}</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full text-4xl font-black text-white outline-none bg-transparent placeholder-gray-600 font-display"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payer Selection */}
                    <div>
                        <label className="block text-xs font-black uppercase mb-2 text-gray-500 font-display">Paid By</label>
                        <div className="flex flex-wrap gap-2">
                            {members.map(m => (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => setPaidBy(m.id)}
                                    className={`px-3 py-1 border-2 font-bold text-sm transition-all ${paidBy === m.id
                                        ? 'bg-ink text-white border-ink shadow-neo-sm'
                                        : 'bg-white text-ink border-gray-300 hover:border-ink'
                                        }`}
                                >
                                    {m.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Split Method (Simplified for MVP) */}
                    <div>
                        <label className="block text-xs font-black uppercase mb-2 text-gray-500 font-display">Split Method</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-5 h-5 border-2 border-ink flex items-center justify-center ${splitMethod === 'equal' ? 'bg-banky-green' : 'bg-white'}`}>
                                    {splitMethod === 'equal' && <Check className="w-3 h-3 text-ink stroke-[4]" />}
                                </div>
                                <span className="font-bold text-ink group-hover:underline">Equally</span>
                            </label>
                            {/* Percentage disabled for MVP simplicity, but UI ready */}
                            <label className="flex items-center gap-2 cursor-not-allowed opacity-50" title="Coming soon">
                                <div className="w-5 h-5 border-2 border-gray-400 bg-gray-100"></div>
                                <span className="font-bold text-gray-400">By % (Pro)</span>
                            </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 font-mono">
                            Each person owes {amount && members.length > 0 ? (parseFloat(amount) / members.length).toFixed(2) : '0.00'}
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-banky-green border-2 border-ink p-4 font-black uppercase tracking-wider shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2 text-lg font-display"
                    >
                        <Check className="w-6 h-6" /> Save Expense
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddExpenseModal;
