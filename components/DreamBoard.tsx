import React, { useState } from 'react';
import { useBanky } from '../context/useBanky';
import { usePreferences } from '../context/PreferencesContext';
import { Plus, X, Target } from 'lucide-react';
import { Goal } from '../types';

const DreamBoard: React.FC = () => {
    const { goals, addGoal, updateGoal } = useBanky();
    const { currency } = usePreferences();
    const [isAddingGoal, setIsAddingGoal] = useState(false);
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [newGoalAmount, setNewGoalAmount] = useState('');
    const [newGoalEmoji, setNewGoalEmoji] = useState('🎯');
    const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
    const [addFundsAmount, setAddFundsAmount] = useState('');

    const handleAddGoal = (e: React.FormEvent) => {
        e.preventDefault();
        addGoal({
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

    return (
        <div className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black uppercase font-display text-ink">Vision Board</h2>
                <button
                    onClick={() => setIsAddingGoal(true)}
                    className="bg-banky-green text-fixed-ink border-2 border-ink px-4 py-2 font-black uppercase shadow-neo hover:-translate-y-1 transition-all flex items-center gap-2 font-display rounded-xl"
                >
                    <Plus className="w-5 h-5" /> New Goal
                </button>
            </div>

            {isAddingGoal && (
                <form onSubmit={handleAddGoal} className="bg-white p-8 border-4 border-ink shadow-neo mb-10 relative animate-fade-in-up rounded-xl">
                    <button type="button" onClick={() => setIsAddingGoal(false)} className="absolute top-4 right-4 p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-gray-400">
                        <X className="w-6 h-6" />
                    </button>

                    <h3 className="text-xl font-black uppercase font-display mb-8 text-center text-ink/40 tracking-widest border-b-2 border-gray-100 pb-4">New Vision Goal</h3>

                    {/* Hero Amount Input */}
                    <div className="text-center relative mb-8">
                        <label className="block text-xs font-black uppercase text-ink/40 mb-2 tracking-widest">Target Amount</label>
                        <div className="relative inline-block w-full max-w-sm">
                            <input
                                required
                                type="number"
                                value={newGoalAmount}
                                onChange={e => setNewGoalAmount(e.target.value)}
                                placeholder="0"
                                className="w-full text-center text-6xl font-black text-ink bg-transparent placeholder-gray-200 focus:outline-none"
                                autoFocus
                            />
                            <span className="absolute top-1/2 -translate-y-1/2 -left-4 text-4xl text-ink/20 font-black">
                                {currency.symbol}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-gray-50 p-4 border-2 border-ink shadow-neo-sm rounded-xl hover:shadow-neo transition-all focus-within:ring-2 focus-within:ring-banky-purple">
                            <label className="block text-xs font-black uppercase mb-2 text-ink/50">Goal Name</label>
                            <input
                                required
                                value={newGoalTitle}
                                onChange={e => setNewGoalTitle(e.target.value)}
                                placeholder="e.g. Dream Vacay"
                                className="w-full bg-transparent font-bold text-xl outline-none text-ink placeholder-gray-300"
                            />
                        </div>
                        <div className="bg-gray-50 p-4 border-2 border-ink shadow-neo-sm rounded-xl hover:shadow-neo transition-all focus-within:ring-2 focus-within:ring-banky-purple">
                            <label className="block text-xs font-black uppercase mb-2 text-ink/50">Emoji Icon</label>
                            <input
                                value={newGoalEmoji}
                                onChange={e => setNewGoalEmoji(e.target.value)}
                                placeholder="🏆"
                                className="w-full bg-transparent font-black text-center text-4xl outline-none"
                                maxLength={2}
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-ink text-white font-black py-5 mt-8 text-xl border-4 border-transparent hover:bg-banky-purple hover:text-white hover:border-ink shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all uppercase tracking-wider font-display flex items-center justify-center gap-3 rounded-xl">
                        <span>Manifest It</span>
                        <Target className="w-6 h-6" />
                    </button>
                </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map((goal) => {
                    const percent = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
                    const isEditing = editingGoalId === goal.id;

                    return (
                        <div key={goal.id} className="bg-white border-2 border-ink shadow-neo p-6 relative group overflow-hidden rounded-xl">
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="w-12 h-12 bg-banky-yellow border-2 border-ink flex items-center justify-center text-2xl shadow-neo-sm rounded-xl">
                                    {goal.emoji}
                                </div>
                                {!isEditing ? (
                                    <button
                                        onClick={() => setEditingGoalId(goal.id)}
                                        className="text-xs font-bold border-2 border-ink px-2 py-1 bg-white hover:bg-gray-100 uppercase text-ink rounded-lg"
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
                                                className="w-full border-2 border-ink p-1 px-2 font-bold text-sm bg-ink text-white rounded-lg"
                                            />
                                            <button type="submit" className="bg-banky-green border-2 border-ink px-2 font-black shadow-sm rounded-lg"><Plus className="w-4 h-4" /></button>
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
    );
};

export default DreamBoard;
