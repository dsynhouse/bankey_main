import React, { useState } from 'react';
import { useBanky } from '../context/useBanky';
import { usePreferences } from '../context/PreferencesContext';
import { calculateNetBalances, simplifyDebts } from '../services/billSplitterService';
import AddExpenseModal from './AddExpenseModal';
import { Plus, Users, CheckCircle, Receipt, Mail, UserPlus, Trash2, X } from 'lucide-react';
import { Member } from '../types';

const BillSplitter: React.FC = () => {
    const { groups, addGroup, addExpense, settleDebt, deleteGroup, deleteExpense, user } = useBanky();
    const { currency } = usePreferences();
    const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
    const [showAddExpense, setShowAddExpense] = useState(false);

    // Group Creation State
    const [newGroupName, setNewGroupName] = useState('');
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);

    // Custom Member State
    const [customMembers, setCustomMembers] = useState<Omit<Member, 'id' | 'balance'>[]>([]);
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberPhone, setNewMemberPhone] = useState('');

    // Derived state
    const effectiveActiveGroupId = activeGroupId || (groups.length > 0 ? groups[0].id : null);
    const activeGroup = groups.find(g => g.id === effectiveActiveGroupId);
    const netBalances = activeGroup ? calculateNetBalances(activeGroup.members, activeGroup.expenses) : {};
    const simplifiedDebts = activeGroup ? simplifyDebts(netBalances) : [];

    const handleAddCustomMember = () => {
        if (!newMemberName) return;
        setCustomMembers([...customMembers, { name: newMemberName, email: newMemberEmail, phone: newMemberPhone }]);
        setNewMemberName('');
        setNewMemberEmail('');
        setNewMemberPhone('');
    };

    const handleCreateGroup = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroupName) return;

        // Start with current user
        const members: Member[] = [
            { id: user?.id || 'me', name: 'You', email: user?.email, balance: 0 }
        ];

        // Add custom members
        customMembers.forEach((m) => {
            members.push({
                id: crypto.randomUUID(),
                name: m.name,
                email: m.email,
                phone: m.phone,
                balance: 0
            });
        });

        // Fallback if no custom members added (for quick testing)
        if (customMembers.length === 0) {
            members.push({ id: crypto.randomUUID(), name: 'Alice', balance: 0 });
            members.push({ id: crypto.randomUUID(), name: 'Bob', balance: 0 });
        }

        addGroup(newGroupName, members);
        setNewGroupName('');
        setCustomMembers([]);
        setIsCreatingGroup(false);
    };

    const handleSettle = (debt: { from: string, to: string, amount: number }) => {
        if (!effectiveActiveGroupId) return;

        const fromMember = activeGroup?.members.find(m => m.id === debt.from);
        const toMember = activeGroup?.members.find(m => m.id === debt.to);

        if (!fromMember || !toMember) return;

        if (confirm(`Settle debt: ${debt.amount} from ${fromMember.name} to ${toMember.name}?`)) {
            settleDebt(effectiveActiveGroupId, debt.from, debt.to, debt.amount);
        }
    };

    const handleDeleteGroup = async () => {
        if (!activeGroup) return;
        if (confirm(`Are you sure you want to delete the group "${activeGroup.name}"? This cannot be undone.`)) {
            await deleteGroup(activeGroup.id);
            setActiveGroupId(null); // Reset selection
        }
    };

    const handleDeleteExpense = async (expenseId: string) => {
        if (!activeGroup) return;
        if (confirm("Are you sure you want to delete this expense?")) {
            await deleteExpense(activeGroup.id, expenseId);
        }
    };

    if (groups.length === 0 && !isCreatingGroup) {
        return (
            <div className="bg-white border-2 border-ink shadow-neo p-8 text-center animate-fade-in rounded-xl">
                <div className="bg-banky-purple text-white w-16 h-16 mx-auto flex items-center justify-center border-2 border-ink shadow-neo-sm mb-4 transform -rotate-3 rounded-xl">
                    <Users className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black uppercase font-display text-ink mb-2">Squad Goals</h2>
                <p className="text-gray-600 font-bold mb-6">Split bills, track IOUs, and keep the friendship drama-free.</p>
                <button
                    onClick={() => setIsCreatingGroup(true)}
                    className="bg-banky-green border-2 border-ink px-6 py-3 font-black uppercase shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all rounded-xl"
                >
                    Start a Group
                </button>
            </div>
        );
    }

    if (isCreatingGroup) {
        return (
            <div className="bg-white border-4 border-ink shadow-neo p-8 animate-fade-in max-w-3xl mx-auto relative rounded-xl">
                <button
                    onClick={() => setIsCreatingGroup(false)}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-ink hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-banky-purple text-white mx-auto flex items-center justify-center border-2 border-ink shadow-neo-sm transform -rotate-3 mb-4 rounded-xl">
                        <Users className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black uppercase font-display tracking-widest text-ink">New Squad</h3>
                    <p className="text-gray-500 font-bold mt-2">Create a space to split bills & track IOUs.</p>
                </div>

                <div className="space-y-8">
                    {/* Group Name input */}
                    <div className="bg-gray-50 p-6 border-2 border-ink shadow-neo-sm rounded-xl hover:shadow-neo transition-all group focus-within:ring-2 focus-within:ring-banky-purple">
                        <label className="block text-xs font-black uppercase mb-3 text-ink/50 tracking-wider">Squad Name</label>
                        <input
                            autoFocus
                            value={newGroupName}
                            onChange={e => setNewGroupName(e.target.value)}
                            placeholder="e.g. Vegas Trip 🎲"
                            className="w-full bg-transparent font-black text-3xl outline-none text-ink placeholder-gray-300"
                        />
                    </div>

                    {/* Members Section */}
                    <div className="bg-white p-6 border-2 border-ink rounded-xl">
                        <h4 className="font-black uppercase text-sm mb-6 flex items-center gap-2 text-ink/70 border-b-2 border-gray-100 pb-2">
                            <UserPlus className="w-4 h-4" /> Squad Members
                        </h4>

                        {/* Add Member Inputs */}
                        <div className="flex flex-col md:flex-row gap-3 mb-6">
                            <input
                                value={newMemberName}
                                onChange={e => setNewMemberName(e.target.value)}
                                placeholder="Name"
                                className="flex-[2] border-2 border-gray-200 p-3 font-bold focus:border-ink outline-none rounded-xl focus:shadow-sm"
                            />
                            <input
                                value={newMemberEmail}
                                onChange={e => setNewMemberEmail(e.target.value)}
                                placeholder="Email (Optional)"
                                className="flex-[2] border-2 border-gray-200 p-3 font-bold focus:border-ink outline-none rounded-xl focus:shadow-sm"
                            />
                            <button
                                type="button"
                                onClick={handleAddCustomMember}
                                disabled={!newMemberName}
                                className="flex-1 bg-ink text-white font-black uppercase text-xs hover:bg-banky-yellow hover:text-ink hover:border-ink transition-all px-4 py-3 rounded-xl border-2 border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add +
                            </button>
                        </div>

                        {/* Member List Preview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 bg-banky-green/10 p-3 border-2 border-banky-green rounded-lg">
                                <div className="w-8 h-8 bg-banky-green text-white flex items-center justify-center rounded-full text-xs font-black border border-ink">Y</div>
                                <span className="font-black text-sm">You (Admin)</span>
                            </div>
                            {customMembers.map((m, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 border-2 border-gray-200 rounded-lg group hover:border-ink transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-banky-purple text-white flex items-center justify-center rounded-full text-xs font-black border border-ink">{m.name[0]}</div>
                                        <div>
                                            <span className="font-bold text-sm block leading-none">{m.name}</span>
                                            {m.email && <span className="text-[10px] text-gray-400 font-mono">{m.email}</span>}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setCustomMembers(customMembers.filter((_, i) => i !== idx))}
                                        className="text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t-2 border-gray-100">
                        <button
                            onClick={handleCreateGroup}
                            disabled={!newGroupName}
                            className="flex-[2] bg-ink text-white py-4 font-black text-lg uppercase border-2 border-ink shadow-neo hover:bg-banky-green hover:text-ink hover:translate-x-1 transition-all disabled:opacity-50 disabled:shadow-none rounded-xl"
                        >
                            Create Squad
                        </button>
                        <button
                            onClick={() => setIsCreatingGroup(false)}
                            className="flex-1 py-4 font-bold text-gray-400 hover:text-ink uppercase border-2 border-transparent hover:bg-gray-50 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header / Group Selector */}
            <div className="flex flex-wrap gap-3 justify-between items-center bg-white border-2 border-ink p-3 sm:p-4 shadow-neo rounded-xl">
                <div className="flex items-center gap-2 min-w-0">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-banky-purple flex-shrink-0" />
                    <select
                        value={effectiveActiveGroupId || ''}
                        onChange={e => setActiveGroupId(e.target.value)}
                        className="font-black uppercase text-base sm:text-xl bg-transparent outline-none cursor-pointer font-display truncate max-w-[120px] sm:max-w-none"
                    >
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                </div>
                <div className="flex flex-wrap gap-2">
                    {activeGroup && (
                        <button
                            onClick={handleDeleteGroup}
                            className="bg-white border-2 border-red-500 text-red-500 px-2 sm:px-3 py-2 font-black uppercase shadow-neo-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-xs flex items-center justify-center rounded-xl"
                            title="Delete Group"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={() => setIsCreatingGroup(true)}
                        className="bg-white border-2 border-ink px-2 sm:px-3 py-2 font-black uppercase shadow-neo-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-[10px] sm:text-xs whitespace-nowrap rounded-xl"
                    >
                        New Group
                    </button>
                    <button
                        onClick={() => setShowAddExpense(true)}
                        className="bg-banky-yellow border-2 border-ink px-2 sm:px-4 py-2 font-black uppercase shadow-neo-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm whitespace-nowrap rounded-xl"
                    >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> Add Expense
                    </button>
                </div>
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
                            <div key={member.id} className="flex justify-between items-center bg-white border-2 border-ink p-3 shadow-sm group rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 flex items-center justify-center font-black text-white border-2 border-ink ${isOwed ? 'bg-banky-green' : owes ? 'bg-banky-pink' : 'bg-gray-300'}`}>
                                        {member.name[0]}
                                    </div>
                                    <div>
                                        <span className="font-bold text-ink block leading-none">{member.name}</span>
                                        {member.email && <span className="text-[10px] text-gray-400 font-mono">{member.email}</span>}
                                    </div>
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
                                    <div key={idx} className="bg-white border-2 border-ink p-4 shadow-neo-sm flex justify-between items-center relative overflow-hidden group rounded-xl">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-banky-pink"></div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-500 mb-1">
                                                <span className="text-ink font-black">{fromName}</span> owes <span className="text-ink font-black">{toName}</span>
                                            </p>
                                            <p className="text-2xl font-black text-ink font-display">{currency.symbol}{debt.amount.toFixed(2)}</p>
                                        </div>
                                        <button
                                            onClick={() => handleSettle(debt)}
                                            className="bg-ink text-white px-3 py-1 text-xs font-black uppercase border-2 border-transparent hover:bg-banky-green hover:text-ink hover:border-ink transition-colors rounded-lg"
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

            {/* Recent Expenses List - Floating Cards */}
            <div className="mt-8">
                <h3 className="text-lg font-black uppercase font-display text-gray-500 border-b-2 border-gray-200 pb-2 mb-6">Recent Expenses</h3>
                <div className="space-y-4">
                    {activeGroup?.expenses.slice().reverse().map(exp => (
                        <div key={exp.id} className="flex justify-between items-center bg-white border-2 border-ink p-4 shadow-neo hover:shadow-neo-lg hover:-translate-y-0.5 transition-all rounded-xl group">
                            <div className="flex items-center gap-4">
                                <div className="bg-banky-yellow border-2 border-ink p-3 shadow-neo-sm transform -rotate-2 group-hover:rotate-0 transition-transform rounded-xl">
                                    <Receipt className="w-5 h-5 text-ink" />
                                </div>
                                <div>
                                    <p className="font-black text-ink text-lg">{exp.description}</p>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                                        Paid by <span className="text-banky-purple">{activeGroup.members.find(m => m.id === exp.paidBy)?.name}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-black text-2xl text-ink font-display">{currency.symbol}{exp.amount.toFixed(2)}</span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteExpense(exp.id); }}
                                    className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                    title="Delete Expense"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {activeGroup?.expenses.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center gap-3">
                            <Receipt className="w-12 h-12 text-gray-300" />
                            <p className="text-gray-400 font-bold">No expenses yet.</p>
                            <button onClick={() => setShowAddExpense(true)} className="text-banky-purple font-black uppercase text-xs hover:underline">
                                + Add First Expense
                            </button>
                        </div>
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
