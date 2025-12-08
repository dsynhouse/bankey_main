
import React, { useState } from 'react';
import { useBanky } from '../context/useBanky';
import { AccountType } from '../types';
import { CreditCard, Wallet, Briefcase, TrendingUp, Plus, X, Trash2, AlertTriangle } from 'lucide-react';

const Accounts: React.FC = () => {
  const { accounts, createAccount, deleteAccount, currency } = useBanky();
  const [showAdd, setShowAdd] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<AccountType>(AccountType.SPENDING);
  const [newAccBalance, setNewAccBalance] = useState('');

  // State for delete confirmation
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    createAccount({
      name: newAccName,
      type: newAccType,
      balance: parseFloat(newAccBalance),
      currency: currency.code,
      color: 'bg-ink'
    });
    setShowAdd(false);
    setNewAccName('');
    setNewAccBalance('');
  };

  const handleDelete = () => {
    if (accountToDelete) {
      deleteAccount(accountToDelete);
      setAccountToDelete(null);
    }
  };

  const getIcon = (type: AccountType) => {
    switch (type) {
      case AccountType.SPENDING: return CreditCard;
      case AccountType.SAVINGS: return Wallet;
      case AccountType.BUSINESS: return Briefcase;
      case AccountType.INVESTMENT: return TrendingUp;
    }
  };

  const getColorClass = (type: AccountType) => {
    switch (type) {
      case AccountType.SPENDING: return 'bg-banky-pink';
      case AccountType.SAVINGS: return 'bg-banky-blue';
      case AccountType.BUSINESS: return 'bg-ink text-white';
      case AccountType.INVESTMENT: return 'bg-banky-green';
    }
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20 font-sans">
      <div className="flex flex-wrap gap-4 justify-between items-end border-b-4 border-ink pb-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-ink uppercase italic tracking-tighter font-display">Wallets</h1>
          <p className="text-gray-500 font-bold mt-2">Stash your cash.</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className={`border-2 border-ink px-4 sm:px-6 py-2 sm:py-3 font-black uppercase flex items-center gap-2 shadow-neo transition-all font-display text-xs sm:text-sm ${showAdd ? 'bg-red-500 text-white' : 'bg-banky-yellow text-ink hover:-translate-y-1'}`}>
          {showAdd ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
          {showAdd ? 'Cancel' : 'Add Wallet'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddAccount} className="bg-white p-8 border-2 border-ink shadow-neo grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="absolute -top-3 -left-3 bg-banky-purple border-2 border-ink px-2 py-1 text-xs font-black text-white uppercase transform -rotate-3 font-display">New Stash</div>
          <div className="space-y-1">
            <label className="text-xs font-black uppercase font-display">Name</label>
            <input required placeholder="e.g. 'Sneaker Fund'" value={newAccName} onChange={e => setNewAccName(e.target.value)} className="w-full border-2 border-ink p-3 font-bold focus:shadow-neo-sm outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black uppercase font-display">Type</label>
            <select value={newAccType} onChange={e => setNewAccType(e.target.value as AccountType)} className="w-full border-2 border-ink p-3 font-bold focus:shadow-neo-sm outline-none bg-white">
              {Object.values(AccountType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black uppercase font-display">Starting Balance</label>
            <input required type="number" placeholder="0.00" value={newAccBalance} onChange={e => setNewAccBalance(e.target.value)} className="w-full border-2 border-ink p-3 font-bold focus:shadow-neo-sm outline-none" />
          </div>
          <button type="submit" className="md:col-span-3 bg-ink text-white font-black py-4 border-2 border-ink hover:bg-gray-800 shadow-neo hover:-translate-y-1 transition-all uppercase tracking-widest mt-2 font-display">
            Create Wallet
          </button>
        </form>
      )}

      {/* Delete Confirmation Modal */}
      {accountToDelete && (
        <div className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-ink shadow-neo-xl p-6 max-w-sm w-full relative animate-fade-in-up">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-red-100 p-4 rounded-full border-2 border-ink">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase font-display mb-2">Delete Wallet?</h3>
                <p className="font-bold text-gray-500">This action cannot be undone. The money inside will vanish (digitally).</p>
              </div>
              <div className="flex gap-2 w-full mt-2">
                <button
                  onClick={() => setAccountToDelete(null)}
                  className="flex-1 py-3 border-2 border-ink font-black uppercase hover:bg-gray-100 transition-colors font-display"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 bg-red-500 text-white border-2 border-ink font-black uppercase hover:bg-red-600 shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all font-display"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {accounts.map(acc => {
          const Icon = getIcon(acc.type);
          const colorClass = getColorClass(acc.type);
          const isDark = acc.type === AccountType.BUSINESS;

          return (
            <div key={acc.id} className={`${colorClass} p-6 border-2 border-ink shadow-neo hover:-translate-y-2 hover:shadow-neo-lg transition-all duration-300 relative group min-h-[220px] flex flex-col justify-between`}>
              <div className="flex justify-between items-start relative z-10">
                <div className={`p-3 border-2 border-ink shadow-neo-sm ${isDark ? 'bg-white text-ink' : 'bg-white text-ink'}`}>
                  <Icon className="w-6 h-6 stroke-[2.5px]" />
                </div>
                <div className="flex gap-2">
                  <span className={`text-xs font-black border-2 border-ink px-2 py-1 uppercase tracking-wider font-display h-fit ${isDark ? 'bg-white text-ink' : 'bg-ink text-white'}`}>
                    {acc.type}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setAccountToDelete(acc.id); }}
                    className={`p-1 border-2 border-ink shadow-sm transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none h-fit ${isDark ? 'bg-white text-ink hover:bg-red-500 hover:text-white' : 'bg-white text-ink hover:bg-red-500 hover:text-white'}`}
                    title="Delete Wallet"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-8 relative z-10">
                <p className={`text-sm font-bold uppercase tracking-wide mb-1 font-display ${isDark ? 'text-gray-400' : 'text-ink/60'}`}>{acc.name}</p>
                <h3 className={`text-4xl font-black tracking-tight font-display ${isDark ? 'text-white' : 'text-ink'}`}>{currency.symbol}{acc.balance.toLocaleString()}</h3>
              </div>

              {/* Decorative Pattern */}
              <div className="absolute bottom-4 right-4 opacity-10">
                <Icon className="w-24 h-24 stroke-[1px]" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Accounts;
