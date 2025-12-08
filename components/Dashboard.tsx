import React, { useState } from 'react';
import { useBanky } from '../context/useBanky';
import BillSplitter from './BillSplitter';
import DreamBoard from './DreamBoard.tsx';
import { FlashCards, RecentMoves, QuickStats } from './dashboard/index';

/**
 * Dashboard - Main dashboard component with tabbed navigation.
 * Refactored to use extracted sub-components for better maintainability.
 */
const Dashboard: React.FC = () => {
    const { accounts, transactions, addTransaction, user, currency, userState } = useBanky();
    const [activeTab, setActiveTab] = useState<'overview' | 'dreamboard' | 'bills'>('overview');

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
            {/* Header / Welcome */}
            <div className="bg-banky-yellow border-4 border-ink p-6 shadow-neo transform hover:-translate-y-1 transition-transform duration-300 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 overflow-hidden">
                {/* Left Side: Text */}
                <div className="text-center md:text-left min-w-0 flex-1">
                    <h1 className="text-3xl md:text-4xl xl:text-5xl font-black uppercase italic tracking-tighter text-ink font-display mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                        YO, {user?.name || 'ROHAN'}!
                    </h1>
                    <p className="text-lg md:text-xl font-bold text-ink font-sans tracking-tight">Let's build that wealth.</p>
                </div>

                {/* Right Side: Date & Tabs */}
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 flex-shrink-0">
                    {/* Date */}
                    <div className="bg-white border-2 border-ink p-2 px-4 shadow-neo-sm transform -rotate-2 hover:rotate-0 transition-transform">
                        <p className="font-mono font-bold text-ink text-sm md:text-base whitespace-nowrap">
                            {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="bg-white border-2 border-ink p-1 shadow-neo-sm flex overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-2 sm:px-4 py-2 font-black uppercase tracking-wider text-[10px] sm:text-xs md:text-sm transition-all whitespace-nowrap ${activeTab === 'overview'
                                ? 'bg-ink text-white shadow-sm'
                                : 'bg-transparent text-gray-400 hover:text-ink'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('dreamboard')}
                            className={`px-2 sm:px-4 py-2 font-black uppercase tracking-wider text-[10px] sm:text-xs md:text-sm transition-all whitespace-nowrap ${activeTab === 'dreamboard'
                                ? 'bg-banky-pink text-ink shadow-sm'
                                : 'bg-transparent text-gray-400 hover:text-ink'
                                }`}
                        >
                            Dream Board
                        </button>
                        <button
                            onClick={() => setActiveTab('bills')}
                            className={`px-2 sm:px-4 py-2 font-black uppercase tracking-wider text-[10px] sm:text-xs md:text-sm transition-all whitespace-nowrap ${activeTab === 'bills'
                                ? 'bg-banky-purple text-white shadow-sm'
                                : 'bg-transparent text-gray-400 hover:text-ink'
                                }`}
                        >
                            Bill Splitter
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            {activeTab === 'overview' && (
                <div className="space-y-8">
                    {/* Top Row: Quick Add & Recent Moves */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <FlashCards
                            accounts={accounts}
                            currency={currency}
                            addTransaction={addTransaction}
                        />
                        <RecentMoves
                            transactions={transactions}
                            currency={currency}
                        />
                    </div>

                    {/* Bottom Row: Stats Cards */}
                    <QuickStats
                        totalBalance={totalBalance}
                        currency={currency}
                        userState={userState}
                    />
                </div>
            )}

            {activeTab === 'dreamboard' && (
                <div className="animate-slide-up">
                    <DreamBoard />
                </div>
            )}

            {activeTab === 'bills' && (
                <div className="animate-slide-up">
                    <BillSplitter />
                </div>
            )}
        </div>
    );
};

export default Dashboard;
