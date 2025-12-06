import React from 'react';
import { Wallet, ArrowUpRight, GraduationCap, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Currency, UserState } from '../../types';

interface QuickStatsProps {
    totalBalance: number;
    currency: Currency;
    userState: UserState;
    totalUnits?: number;
}

/**
 * QuickStats component displays net worth, financial IQ progress, and premium promo.
 * Extracted from Dashboard for better maintainability.
 */
const QuickStats: React.FC<QuickStatsProps> = ({
    totalBalance,
    currency,
    userState,
    totalUnits = 44
}) => {
    const rawProgress = (userState.completedUnitIds?.length || 0) / totalUnits * 100;
    const progressPercent = Math.min(rawProgress, 100);

    const formatCurrency = (value: number) => {
        return `${currency.symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Net Worth Card */}
            <div className="lg:col-span-2 bg-white border-4 border-ink p-6 shadow-neo relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-banky-green px-4 py-1 border-l-4 border-b-4 border-ink font-black uppercase text-xs tracking-widest">
                    Total Balance
                </div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-banky-blue border-2 border-ink rounded-full">
                        <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-black uppercase font-display">Net Worth</h2>
                </div>
                <p className="text-5xl md:text-7xl font-black text-ink tracking-tighter font-display mb-4">
                    {formatCurrency(totalBalance)}
                </p>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-banky-green font-bold bg-green-50 px-3 py-1 rounded-full border-2 border-green-200">
                        <ArrowUpRight className="w-5 h-5" />
                        <span>+12% this month</span>
                    </div>
                </div>
            </div>

            {/* Financial IQ Teaser */}
            <div className="bg-banky-purple p-6 shadow-neo border-4 border-ink text-white flex flex-col justify-between relative overflow-hidden group h-full">
                <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAABVJREFUKFNjZCASMIIA7R6q6R5K5wAAbk8BCk/7u7AAAAAASUVORK5CYII=')] opacity-10"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="bg-white text-ink border-2 border-ink p-1 shadow-neo-sm">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <span className="font-black tracking-widest bg-ink text-white px-2 py-1 transform -rotate-2 font-display uppercase">The Academy</span>
                    </div>
                    <h3 className="text-3xl font-black mb-2 uppercase leading-none drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] font-display">Financial IQ</h3>

                    <div className="mt-4 mb-2">
                        <div className="flex justify-between text-xs font-bold uppercase mb-1 text-white">
                            <span>Current Progress</span>
                            <span>{Math.round(progressPercent)}%</span>
                        </div>
                        <div className="w-full h-4 bg-black/30 border border-white/30 rounded-full overflow-hidden">
                            <div className="h-full bg-banky-yellow" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>

                    <p className="text-white font-medium text-sm opacity-90 leading-relaxed mt-2">
                        Next Up: Credit Scores & Taxes. Don't let the IRS catch you slipping.
                    </p>
                </div>
                <Link to="/education" className="relative z-10 mt-6 w-full bg-banky-yellow text-fixed-ink border-2 border-ink shadow-neo font-black py-4 text-center hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase tracking-wider text-lg font-display">
                    Continue Learning
                </Link>
            </div>

            {/* Premium Promo Card */}
            <div className="bg-gradient-to-br from-gray-900 to-black p-6 shadow-neo border-4 border-ink text-white flex flex-col justify-between relative overflow-hidden group h-full">
                <Link to="/settings?tab=premium" className="absolute top-0 right-0 bg-yellow-400 text-ink text-xs font-black px-2 py-1 uppercase hover:bg-yellow-300 transition-colors">
                    Upgrade
                </Link>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="bg-white text-ink border-2 border-ink p-1 shadow-neo-sm">
                            <Sparkles className="w-6 h-6 text-yellow-500" />
                        </div>
                        <span className="font-black tracking-widest bg-yellow-400 text-ink px-2 py-1 transform -rotate-2 font-display uppercase">Premium</span>
                    </div>
                    <h3 className="text-3xl font-black mb-2 uppercase leading-none font-display">
                        Go Pro
                    </h3>
                    <p className="text-gray-300 font-medium text-sm leading-relaxed mt-2">
                        Unlock AI Advisor, Voice Commands, and Bank Sync.
                    </p>
                </div>

                <Link to="/settings?tab=premium" className="relative z-10 mt-6 w-full bg-white text-ink border-2 border-ink shadow-neo font-black py-4 text-center hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase tracking-wider text-lg font-display flex items-center justify-center gap-2">
                    Upgrade <ArrowUpRight className="w-5 h-5" />
                </Link>
            </div>
        </div>
    );
};

export default QuickStats;
