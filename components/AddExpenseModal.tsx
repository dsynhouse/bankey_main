import React, { useState } from 'react';
import { Member, Expense } from '../types';
import { calculateSplits } from '../services/billSplitterService';
import { X, DollarSign, Check, Percent } from 'lucide-react';

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
    const [percentages, setPercentages] = useState<{ [id: string]: number }>({});

    // Initialize percentages equally - Logic moved to button click

    const handlePercentageChange = (memberId: string, value: string) => {
        const num = parseFloat(value) || 0;
        setPercentages(prev => ({ ...prev, [memberId]: num }));
    };

    const totalPercentage: number = Object.values(percentages).reduce<number>((sum, val) => sum + (val as number), 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !paidBy) return;

        const numAmount = parseFloat(amount);
        if (numAmount <= 0) {
            alert("Amount must be positive!");
            return;
        }

        if (splitMethod === 'percentage' && Math.abs(totalPercentage - 100) > 0.1) {
            alert(`Total percentage must be 100%. Current: ${totalPercentage.toFixed(1)}%`);
            return;
        }

        // Calculate splits
        const memberIds = members.map(m => m.id);
        const splitDetails = calculateSplits(numAmount, memberIds, splitMethod, percentages);

        const newExpense = {
            description,
            amount: numAmount,
            paidBy,
            date: new Date().toISOString(),
            splitDetails,
            splitMethod
        };

        onAdd(newExpense);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-white border-2 border-ink shadow-neo w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-6 h-6" />
                </button>

                <div className="p-6">
                    <h3 className="text-xl font-black uppercase font-display mb-6 flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-banky-green" /> Add Expense
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-black uppercase mb-1 text-gray-500">Description</label>
                            <input
                                autoFocus
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="e.g. Dinner, Taxi"
                                className="w-full border-2 border-ink p-3 font-bold outline-none focus:shadow-neo-sm transition-shadow"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black uppercase mb-1 text-gray-500">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 font-bold text-gray-400">{currencySymbol}</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full border-2 border-ink p-3 pl-8 font-mono font-bold outline-none focus:shadow-neo-sm transition-shadow"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase mb-1 text-gray-500">Paid By</label>
                                <select
                                    value={paidBy}
                                    onChange={e => setPaidBy(e.target.value)}
                                    className="w-full border-2 border-ink p-3 font-bold outline-none focus:shadow-neo-sm transition-shadow bg-white"
                                >
                                    {members.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase mb-2 text-gray-500">Split Method</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSplitMethod('equal')}
                                    className={`flex-1 py-2 font-black uppercase border-2 transition-all ${splitMethod === 'equal' ? 'bg-banky-yellow border-ink shadow-neo-sm' : 'bg-white border-gray-200 text-gray-400 hover:border-ink hover:text-ink'}`}
                                >
                                    Equally
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSplitMethod('percentage');
                                        const initialPct = 100 / members.length;
                                        const newPcts: { [id: string]: number } = {};
                                        members.forEach(m => newPcts[m.id] = parseFloat(initialPct.toFixed(2)));
                                        setPercentages(newPcts);
                                    }}
                                    className={`flex-1 py-2 font-black uppercase border-2 transition-all flex items-center justify-center gap-2 ${splitMethod === 'percentage' ? 'bg-banky-purple text-white border-ink shadow-neo-sm' : 'bg-white border-gray-200 text-gray-400 hover:border-ink hover:text-ink'}`}
                                >
                                    <Percent className="w-4 h-4" /> By %
                                </button>
                            </div>
                        </div>

                        {splitMethod === 'percentage' && (
                            <div className="bg-gray-50 p-4 border-2 border-gray-200 space-y-2">
                                {members.map(m => (
                                    <div key={m.id} className="flex items-center justify-between">
                                        <span className="font-bold text-sm">{m.name}</span>
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                value={percentages[m.id] || ''}
                                                onChange={e => handlePercentageChange(m.id, e.target.value)}
                                                className="w-16 border-2 border-gray-300 p-1 font-mono text-right font-bold focus:border-ink outline-none"
                                            />
                                            <span className="font-black text-gray-400">%</span>
                                        </div>
                                    </div>
                                ))}
                                <div className={`text-right text-xs font-black ${Math.abs(totalPercentage - 100) < 0.1 ? 'text-banky-green' : 'text-banky-pink'}`}>
                                    Total: {totalPercentage.toFixed(1)}%
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-ink text-white py-4 font-black uppercase border-2 border-transparent hover:bg-banky-green hover:text-ink hover:border-ink transition-colors flex items-center justify-center gap-2 mt-4"
                        >
                            <Check className="w-5 h-5" /> Save Expense
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddExpenseModal;
