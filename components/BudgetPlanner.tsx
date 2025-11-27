
import React, { useState } from 'react';
import { useBanky } from '../context/useBanky';
import { Category } from '../types';
import { Edit2, TrendingUp, AlertTriangle, Check, X } from 'lucide-react';
import Mascot from './Mascot';
import CategoryIcon from './CategoryIcon';

const BudgetPlanner: React.FC = () => {
  const { transactions, budgets, updateBudget, currency } = useBanky();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [tempLimit, setTempLimit] = useState<string>('');

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Helper to get spending for a category in current month
  const getSpent = (cat: Category) => {
    return transactions
      .filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth &&
          d.getFullYear() === currentYear &&
          t.category === cat &&
          t.type === 'expense';
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getBudget = (cat: Category) => {
    return budgets.find(b => b.category === cat)?.limit || 0;
  };

  const handleEditClick = (cat: Category, currentLimit: number) => {
    setEditingCategory(cat);
    setTempLimit(currentLimit.toString());
  };

  const handleSave = () => {
    if (editingCategory && tempLimit) {
      updateBudget(editingCategory, parseFloat(tempLimit));
      setEditingCategory(null);
      setTempLimit('');
    }
  };

  // Calculate overall health for mascot mood
  let overBudgetCount = 0;
  Object.values(Category).forEach(cat => {
    if (cat === Category.INCOME || cat === Category.BUSINESS) return;
    const limit = getBudget(cat);
    if (limit > 0 && getSpent(cat) > limit) overBudgetCount++;
  });

  const mascotMood = overBudgetCount > 1 ? 'shocked' : overBudgetCount > 0 ? 'happy' : 'cool';

  return (
    <div className="space-y-8 animate-fade-in pb-20 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-end border-b-4 border-ink pb-4 gap-4">
        <div>
          <h1 className="text-5xl font-black text-ink uppercase italic tracking-tighter font-display">The Limit</h1>
          <p className="text-gray-500 font-bold mt-2">Don't blow the bag in one place.</p>
        </div>
        <div className="hidden md:block">
          <Mascot className="w-20 h-20" mood={mascotMood} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(Category)
          .filter(cat => cat !== Category.INCOME && cat !== Category.BUSINESS) // Exclude Income/Business for personal budgeting
          .map(cat => {
            const spent = getSpent(cat);
            const limit = getBudget(cat);
            const percent = limit > 0 ? (spent / limit) * 100 : 0;

            let barColor = 'bg-banky-green';
            if (percent > 75) { barColor = 'bg-banky-orange'; }
            if (percent > 100) { barColor = 'bg-red-500'; }

            const isEditing = editingCategory === cat;

            return (
              <div key={cat} className="bg-white border-2 border-ink shadow-neo p-6 relative group hover:-translate-y-1 transition-transform">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 border-2 border-ink flex items-center justify-center text-xl shadow-neo-sm ${limit > 0 ? 'bg-banky-yellow' : 'bg-gray-100'}`}>
                      <CategoryIcon category={cat} className="w-5 h-5" />
                    </div>
                    <span className="font-black uppercase text-ink tracking-wide font-display">{cat}</span>
                  </div>
                  <button
                    onClick={() => handleEditClick(cat, limit)}
                    className="p-2 hover:bg-gray-100 border-2 border-transparent hover:border-ink transition-all"
                  >
                    <Edit2 className="w-4 h-4 text-gray-400 hover:text-ink" />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-3xl font-black text-ink font-display">{currency.symbol}{spent.toLocaleString()}</span>
                    <span className="font-mono text-gray-500 text-sm font-bold">/ {currency.symbol}{limit.toLocaleString()}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-6 border-2 border-ink bg-gray-100 relative overflow-hidden">
                    {/* Striped pattern for over budget */}
                    {percent > 100 && (
                      <div className="absolute inset-0 w-full h-full" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)' }}></div>
                    )}
                    <div
                      className={`h-full border-r-2 border-ink transition-all duration-500 ${barColor}`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {percent > 100 && (
                  <div className="flex items-center gap-2 text-red-600 font-bold text-sm bg-red-100 p-2 border-2 border-red-500">
                    <AlertTriangle className="w-4 h-4" />
                    <span>You blew the budget!</span>
                  </div>
                )}

                {limit === 0 && spent > 0 && (
                  <div className="flex items-center gap-2 text-gray-500 font-bold text-sm bg-gray-100 p-2 border-2 border-dashed border-gray-400">
                    <TrendingUp className="w-4 h-4" />
                    <span>Set a limit to track this.</span>
                  </div>
                )}

                {/* Edit Modal (Inline Overlay) */}
                {isEditing && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 border-2 border-ink m-[-2px]">
                    <h3 className="font-black uppercase mb-4 text-xl font-display">Set Limit for {cat}</h3>
                    <div className="flex items-center gap-2 w-full mb-4">
                      <span className="text-2xl font-black font-display">{currency.symbol}</span>
                      <input
                        autoFocus
                        type="number"
                        value={tempLimit}
                        onChange={e => setTempLimit(e.target.value)}
                        className="w-full text-3xl font-black border-b-4 border-ink focus:outline-none bg-ink text-white font-display p-2"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex gap-2 w-full">
                      <button onClick={() => setEditingCategory(null)} className="flex-1 py-3 border-2 border-ink font-bold hover:bg-gray-100 flex justify-center items-center"><X className="w-6 h-6" /></button>
                      <button onClick={handleSave} className="flex-1 py-3 bg-banky-yellow border-2 border-ink font-bold shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex justify-center items-center"><Check className="w-6 h-6" /></button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default BudgetPlanner;
