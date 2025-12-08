import React, { useState } from 'react';
import { useBanky } from '../context/useBanky';
import { calculateNetBalances, simplifyDebts } from '../services/billSplitterService';
import { notifyMember, generateSettlementNotification } from '../services/notificationService';
import AddExpenseModal from './AddExpenseModal';
import { Plus, Users, CheckCircle, Receipt, Mail, UserPlus, Trash2 } from 'lucide-react';
import { Member } from '../types';

const BillSplitter: React.FC = () => {
    const { groups, addGroup, addExpense, settleDebt, deleteGroup, deleteExpense, currency, user } = useBanky();
    const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
    const [showAddExpense, setShowAddExpense] = useState(false);

    // ... (state)

    // ... (handlers)

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

    // Auto-select first group or prompt to create
    // Auto-select first group or prompt to create - Logic handled via derived state below

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

            // Notify
            const message = generateSettlementNotification(fromMember, toMember, debt.amount);
            notifyMember(toMember, "Debt Settled", message);


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
            <div className="bg-white border-2 border-ink shadow-neo p-6 animate-fade-in max-w-2xl mx-auto">
                <h3 className="text-xl font-black uppercase font-display mb-4 border-b-2 border-gray-100 pb-2">Create New Squad</h3>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-black uppercase mb-1 text-gray-500">Group Name</label>
                        <input
                            autoFocus
                            value={newGroupName}
                            onChange={e => setNewGroupName(e.target.value)}
                            placeholder="e.g. Roommates, Trip to Vegas"
                            className="w-full border-2 border-ink p-3 font-bold outline-none focus:shadow-neo-sm transition-shadow text-lg"
                        />
                    </div>

                    <div className="bg-gray-50 p-4 border-2 border-gray-200 rounded-lg">
                        <h4 className="font-black uppercase text-sm mb-3 flex items-center gap-2">
                            <UserPlus className="w-4 h-4" /> Add Members
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                            <input
                                value={newMemberName}
                                onChange={e => setNewMemberName(e.target.value)}
                                placeholder="Name"
                                className="border-2 border-gray-300 p-2 font-bold text-sm focus:border-ink outline-none"
                            />
                            <input
                                value={newMemberEmail}
                                onChange={e => setNewMemberEmail(e.target.value)}
                                placeholder="Email (Optional)"
                                className="border-2 border-gray-300 p-2 font-bold text-sm focus:border-ink outline-none"
                            />
                            <button
                                type="button"
                                onClick={handleAddCustomMember}
                                disabled={!newMemberName}
                                className="bg-white border-2 border-ink font-black uppercase text-xs hover:bg-banky-yellow disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Member
                            </button>
                        </div>

                        {/* Member List Preview */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                <div className="w-6 h-6 bg-banky-green text-white flex items-center justify-center rounded-full text-xs">Y</div>
                                You (Admin)
                            </div>
                            {customMembers.map((m, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-white p-2 border border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-banky-purple text-white flex items-center justify-center rounded-full text-xs">{m.name[0]}</div>
                                        <span className="font-bold text-sm">{m.name}</span>
                                    </div>
                                    <div className="flex gap-2 text-xs text-gray-400">
                                        {m.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {m.email}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleCreateGroup}
                            disabled={!newGroupName}
                            className="flex-1 bg-ink text-white py-3 font-black uppercase border-2 border-transparent hover:bg-banky-green hover:text-ink hover:border-ink transition-colors disabled:opacity-50"
                        >
                            Create Squad
                        </button>
                        <button
                            onClick={() => setIsCreatingGroup(false)}
                            className="px-6 font-bold text-gray-500 hover:text-ink uppercase"
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
            <div className="flex flex-wrap gap-3 justify-between items-center bg-white border-2 border-ink p-3 sm:p-4 shadow-neo">
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
                            className="bg-white border-2 border-red-500 text-red-500 px-2 sm:px-3 py-2 font-black uppercase shadow-neo-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-xs flex items-center justify-center"
                            title="Delete Group"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={() => setIsCreatingGroup(true)}
                        className="bg-white border-2 border-ink px-2 sm:px-3 py-2 font-black uppercase shadow-neo-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-[10px] sm:text-xs whitespace-nowrap"
                    >
                        New Group
                    </button>
                    <button
                        onClick={() => setShowAddExpense(true)}
                        className="bg-banky-yellow border-2 border-ink px-2 sm:px-4 py-2 font-black uppercase shadow-neo-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm whitespace-nowrap"
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
                            <div key={member.id} className="flex justify-between items-center bg-white border-2 border-ink p-3 shadow-sm group">
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
                            <div className="flex items-center gap-3">
                                <span className="font-mono font-bold text-ink">{currency.symbol}{exp.amount.toFixed(2)}</span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteExpense(exp.id); }}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                    title="Delete Expense"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
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
