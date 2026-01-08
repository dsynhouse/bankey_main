import React, { useMemo } from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import { useBanky } from '../../context/useBanky';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';

const ForecastWidget: React.FC = () => {
    const { user } = useBanky();
    const { transactions } = useTransactions(user?.id);

    const forecast = useMemo(() => {
        if (!transactions || transactions.length === 0) return null;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const currentDay = now.getDate();
        const daysRemaining = daysInMonth - currentDay;

        // Filter valid expenses for this month
        const thisMonthTx = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth &&
                d.getFullYear() === currentYear &&
                t.type === 'expense';
        });

        const totalSpent = thisMonthTx.reduce((sum, t) => sum + t.amount, 0);

        // Simple Linear Projection
        // Prevent division by zero if it's the very start of the 1st day (use 1 as min)
        const effectiveDays = Math.max(currentDay, 1);
        const avgDailySpend = totalSpent / effectiveDays;
        const projectedSpend = totalSpent + (avgDailySpend * daysRemaining);

        // Get Income (simplified: just sum all income for now, or use a fixed budget if available)
        // Ideally we'd compare against Budget Limit, but let's compare against Income for "Balance"
        const thisMonthIncome = transactions
            .filter(t => {
                const d = new Date(t.date);
                return d.getMonth() === currentMonth &&
                    d.getFullYear() === currentYear &&
                    t.type === 'income';
            })
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            currentSpent: totalSpent,
            projectedSpend,
            avgDailySpend,
            income: thisMonthIncome,
            status: projectedSpend > thisMonthIncome ? 'danger' : 'safe'
        };
    }, [transactions]);

    if (!forecast) return null;

    return (
        <div className="bg-white border-2 border-ink shadow-neo rounded-xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            {/* Header */}
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter">Crystal Ball</h3>
                    <p className="text-xs font-bold text-gray-500 uppercase">End of Month Forecast</p>
                </div>
                <div className={`p-2 rounded-lg border-2 border-ink ${forecast.status === 'safe' ? 'bg-banky-green text-white' : 'bg-banky-pink text-white'}`}>
                    {forecast.status === 'safe' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                </div>
            </div>

            {/* Main Numbers */}
            <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-[10px] font-black uppercase text-gray-400">Current Spend</p>
                    <p className="text-xl font-black text-ink">₹{forecast.currentSpent.toLocaleString()}</p>
                </div>
                <div className={`p-3 rounded-lg border-2 border-ink ${forecast.status === 'safe' ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p className="text-[10px] font-black uppercase text-gray-500">Projected Total</p>
                    <p className={`text-xl font-black ${forecast.status === 'safe' ? 'text-green-600' : 'text-red-500'}`}>
                        ₹{Math.round(forecast.projectedSpend).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Analysis Text */}
            <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-200 relative z-10">
                <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-banky-blue" />
                    <span className="text-xs font-bold">Daily Pace: ₹{Math.round(forecast.avgDailySpend)} / day</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                    {forecast.status === 'safe'
                        ? "You're on track to save this month! Keep it up."
                        : "Caution: You might overspend earnings by month end."}
                </p>
            </div>

            {/* Background Decor */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-banky-yellow rounded-full opacity-20 blur-xl group-hover:scale-150 transition-transform duration-500"></div>
        </div>
    );
};

export default ForecastWidget;
