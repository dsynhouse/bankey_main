import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Transaction, Currency } from '../../types';

interface RecentMovesProps {
    transactions: Transaction[];
    currency: Currency;
}

/**
 * RecentMoves component displays the most recent transactions.
 * Extracted from Dashboard for better maintainability.
 */
const RecentMoves: React.FC<RecentMovesProps> = ({ transactions, currency }) => {
    const recentTransactions = transactions.slice(0, 4);

    const formatCurrency = (value: number) => {
        return `${currency.symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="bg-white border-4 border-ink p-6 shadow-neo h-full flex flex-col">
            <h3 className="text-xl font-black uppercase font-display mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-banky-purple" /> Recent Moves
            </h3>
            <div className="space-y-4 flex-1">
                {recentTransactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 font-mono text-sm">
                        No moves yet. Go spend some cash!
                    </div>
                ) : (
                    recentTransactions.map(t => (
                        <div
                            key={t.id}
                            className="flex items-center justify-between p-3 border-2 border-gray-100 hover:border-ink hover:bg-gray-50 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full border-2 border-ink ${t.type === 'expense' ? 'bg-banky-pink text-white' : 'bg-banky-green text-ink'
                                    }`}>
                                    {t.type === 'expense'
                                        ? <ArrowDownRight className="w-4 h-4" />
                                        : <ArrowUpRight className="w-4 h-4" />
                                    }
                                </div>
                                <div>
                                    <p className="font-bold text-ink leading-tight">{t.description}</p>
                                    <p className="text-xs font-mono text-gray-500">
                                        {new Date(t.date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <span className={`font-black font-mono ${t.type === 'expense' ? 'text-banky-pink' : 'text-banky-green'
                                }`}>
                                {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
                            </span>
                        </div>
                    ))
                )}
            </div>
            <Link
                to="/tracker"
                className="w-full mt-6 py-2 border-2 border-dashed border-gray-300 text-gray-400 font-bold uppercase hover:border-ink hover:text-ink transition-colors text-sm text-center block"
            >
                View All History
            </Link>
        </div>
    );
};

export default RecentMoves;

