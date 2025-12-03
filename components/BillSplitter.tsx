import React, { useState, useEffect } from 'react';
import { useBanky } from '../context/useBanky';
import { calculateNetBalances, simplifyDebts } from '../services/billSplitterService';
import AddExpenseModal from './AddExpenseModal';
import { Plus, Users, ArrowRight, CheckCircle, Receipt } from 'lucide-react';
import { Member } from '../types';

const BillSplitter: React.FC = () => {
    const { groups, addGroup, addExpense, settleDebt, currency, user } = useBanky();
    const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
    const [showAddExpense, setShowAddExpense] = useState(false);

    // Local state for creating a new group (MVP: Auto-create one if none exists)
    const [newGroupName, setNewGroupName] = useState('');
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);

    // Derived state
    const activeGroup = groups.find(g => g.id === activeGroupId);
    const netBalances = activeGroup ? calculateNetBalances(activeGroup.members, activeGroup.expenses) : {};
    const simplifiedDebts = activeGroup ? simplifyDebts(netBalances) : [];

    // Auto-select first group or prompt to create
    useEffect(() => {
        if (groups.length > 0 && !activeGroupId) {
            setActiveGroupId(groups[0].id);
        }
    }, [groups, activeGroupId]);

    const handleCreateGroup = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroupName) return;

        // MVP: Add current user + 2 mock friends
        const members: Member[] = [
            { id: user?.id || 'me', name: 'You', balance: 0 },
            { id: 'friend1', name: 'Alice', balance: 0 },
            { id: 'friend2', name: 'Bob', balance: 0 }
        ];

        addGroup(newGroupName, members);
        setNewGroupName('');
        setIsCreatingGroup(false);
    };

    const handleSettle = (debt: { from: string, to: string, amount: number }) => {
        if (!activeGroupId) return;
        if (confirm(`Settle debt: ${debt.amount} from ${activeGroup?.members.find(m => m.id === debt.from)?.name} to ${activeGroup?.members.find(m => m.id === debt.to)?.name}?`)) {
            settleDebt(activeGroupId, debt.from, debt.to, debt.amount);
        }
    };

    if (groups.length === 0 && !isCreatingGroup) {
        return (
            <div className="bg-white border-2 border-ink shadow-neo p-8 text-center animate-fade-in">
                <div className="bg-banky-purple text-white w-16 h-16 mx-auto flex items-center justify-center border-2 border-ink shadow-neo-sm mb-4 transform -rotate-3">
                    <Users className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black uppercase font-display text-ink mb-2">Squad Goals</h2>
                <p className="text-gray-600 font-bold mb-6">Split bills, track IOUs, and keep the friendship drama-free.</p>
                <button
                    onClick={() => setIsCreatingGroup(true)}
                    className="bg-banky-green border-2 border-ink px-6 py-3 font-black uppercase shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                >
                    Start a Group
                </button>
            </div>
        );
    }

    if (isCreatingGroup) {
        return (
            <div className="bg-white border-2 border-ink shadow-neo p-6 animate-fade-in">
                <h3 className="text-xl font-black uppercase font-display mb-4">Name your Squad</h3>
                <form onSubmit={handleCreateGroup} className="flex gap-2">
                    <input
                        autoFocus
                        value={newGroupName}
                        onChange={e => setNewGroupName(e.target.value)}
                        placeholder="e.g. Roommates, Trip to Vegas"
                        className="flex-1 border-2 border-ink p-2 font-bold outline-none focus:shadow-neo-sm transition-shadow"
                    />
                    <button type="submit" className="bg-ink text-white px-4 font-black uppercase border-2 border-transparent hover:bg-banky-yellow hover:text-ink hover:border-ink transition-colors">
                        Create
                    </button>
                </form>
                <button onClick={() => setIsCreatingGroup(false)} className="text-xs font-bold text-gray-400 mt-2 hover:text-ink uppercase">Cancel</button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header / Group Selector */}
            <div className="flex justify-between items-center bg-white border-2 border-ink p-4 shadow-neo">
                <div className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-banky-purple" />
                    <select
                        value={activeGroupId || ''}
                        onChange={e => setActiveGroupId(e.target.value)}
                        className="font-black uppercase text-xl bg-transparent outline-none cursor-pointer font-display"
                    >
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                </div>
                <button
                    onClick={() => setShowAddExpense(true)}
                    className="bg-banky-yellow border-2 border-ink px-4 py-2 font-black uppercase shadow-neo-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2 text-sm"
                >
                    <Plus className="w-4 h-4" /> Add Expense
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Balances Column */}
                <div className="space-y-4">
                    <h3 className="text-lg font-black uppercase font-display text-gray-500 border-b-2 border-gray-200 pb-2">Net Balances</h3>
                    {activeGroup?.members.map(member => {
                        const bal = netBalances[member.id] || 0;
                        const isOwed = bal > 0.01;
                        const owes = bal < -0.01;

                        return (
                            <div key={member.id} className="flex justify-between items-center bg-white border-2 border-ink p-3 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 flex items-center justify-center font-black text-white border-2 border-ink ${isOwed ? 'bg-banky-green' : owes ? 'bg-banky-pink' : 'bg-gray-300'}`}>
                                        {member.name[0]}
                                    </div>
                                    <span className="font-bold text-ink">{member.name}</span>
                                </div>
                                <div className={`font-mono font-bold ${isOwed ? 'text-banky-green' : owes ? 'text-banky-pink' : 'text-gray-400'}`}>
                                    {isOwed ? '+' : ''}{currency.symbol}{bal.toFixed(2)}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Simplified Debts / Settle Up */}
                <div className="space-y-4">
                    <h3 className="text-lg font-black uppercase font-display text-gray-500 border-b-2 border-gray-200 pb-2 flex justify-between items-center">
                        <span>Smart Settlement</span>
                        <span className="text-xs bg-banky-purple text-white px-2 py-1 rounded-full">Optimized</span>
                    </h3>

                    {simplifiedDebts.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 bg-gray-50">
                            <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="font-bold">All settled up!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {simplifiedDebts.map((debt, idx) => {
                                const fromName = activeGroup?.members.find(m => m.id === debt.from)?.name;
                                const toName = activeGroup?.members.find(m => m.id === debt.to)?.name;

                                return (
                                    <div key={idx} className="bg-white border-2 border-ink p-4 shadow-neo-sm flex justify-between items-center relative overflow-hidden group">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-banky-pink"></div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-500 mb-1">
                                                <span className="text-ink font-black">{fromName}</span> owes <span className="text-ink font-black">{toName}</span>
                                            </p>
                                            <p className="text-2xl font-black text-ink font-display">{currency.symbol}{debt.amount.toFixed(2)}</p>
                                        </div>
                                        <button
                                            onClick={() => handleSettle(debt)}
                                            className="bg-ink text-white px-3 py-1 text-xs font-black uppercase border-2 border-transparent hover:bg-banky-green hover:text-ink hover:border-ink transition-colors"
                                        >
                                            Settle
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Expenses List */}
            <div className="mt-8">
                <h3 className="text-lg font-black uppercase font-display text-gray-500 border-b-2 border-gray-200 pb-2 mb-4">Recent Expenses</h3>
                <div className="space-y-2">
                    {activeGroup?.expenses.slice().reverse().map(exp => (
                        <div key={exp.id} className="flex justify-between items-center bg-gray-50 border-b border-gray-200 p-3 hover:bg-white transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="bg-white border-2 border-ink p-1 shadow-sm">
                                    <Receipt className="w-4 h-4 text-gray-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-ink">{exp.description}</p>
                                    <p className="text-xs text-gray-500">Paid by {activeGroup.members.find(m => m.id === exp.paidBy)?.name}</p>
                                </div>
                            </div>
                            <span className="font-mono font-bold text-ink">{currency.symbol}{exp.amount.toFixed(2)}</span>
                        </div>
                    ))}
                    {activeGroup?.expenses.length === 0 && (
                        <p className="text-center text-gray-400 text-sm italic py-4">No expenses yet.</p>
                    )}
                </div>
            </div>

            {showAddExpense && activeGroup && (
                <AddExpenseModal
                    members={activeGroup.members}
                    onClose={() => setShowAddExpense(false)}
                    onAdd={(exp) => addExpense(activeGroup.id, exp)}
                    currencySymbol={currency.symbol}
                />
            )}
        </div>
    );
};

export default BillSplitter;
