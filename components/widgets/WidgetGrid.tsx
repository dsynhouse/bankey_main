import React from 'react';
import { useWidgets } from '../../context/WidgetContext';
import FlashCards from '../dashboard/FlashCards';
import RecentMoves from '../dashboard/RecentMoves';
import QuickStats from '../dashboard/QuickStats';
import { useBanky } from '../../context/useBanky';
import { usePreferences } from '../../context/PreferencesContext';

/**
 * WidgetGrid - Main widget container for the AI Home dashboard
 * Renders enabled widgets in a responsive grid layout
 */
interface WidgetGridProps {
    onAddWidget?: () => void;
    onViewHistory?: () => void;
}

const WidgetGrid: React.FC<WidgetGridProps> = ({ onAddWidget, onViewHistory }) => {
    const { enabledWidgets } = useWidgets();
    const { accounts, transactions, addTransaction, deleteTransaction, userState } = useBanky();
    const { currency } = usePreferences();

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    const renderWidget = (widgetId: string, widgetType: string) => {
        switch (widgetType) {
            case 'flash-cards':
                return (
                    <FlashCards
                        key={widgetId}
                        accounts={accounts}
                        currency={currency}
                        addTransaction={addTransaction}
                    />
                );

            case 'recent-moves':
                return (
                    <RecentMoves
                        key={widgetId}
                        transactions={transactions}
                        currency={currency}
                        onDelete={deleteTransaction}
                        onViewHistory={onViewHistory}
                    />
                );

            case 'quick-stats':
                return (
                    <QuickStats
                        key={widgetId}
                        totalBalance={totalBalance}
                        currency={currency}
                        userState={userState}
                    />
                );

            // Placeholder for future widgets
            case 'ai-insights':
                return (
                    <div key={widgetId} className="bg-gradient-to-br from-banky-purple to-banky-pink border-4 border-ink p-8 shadow-neo text-center text-white">
                        <h3 className="text-2xl font-black uppercase mb-2">AI Insights</h3>
                        <p className="opacity-80">Coming Soon - Smart financial insights powered by AI</p>
                    </div>
                );

            case 'spending-heatmap':
                return (
                    <div key={widgetId} className="bg-gradient-to-br from-banky-blue to-banky-green border-4 border-ink p-8 shadow-neo text-center text-ink">
                        <h3 className="text-2xl font-black uppercase mb-2">Spending Heatmap</h3>
                        <p className="opacity-80">Coming Soon - Visual spending patterns</p>
                    </div>
                );

            case 'goal-tracker':
                return (
                    <div key={widgetId} className="bg-gradient-to-br from-banky-yellow to-banky-pink border-4 border-ink p-8 shadow-neo text-center text-ink">
                        <h3 className="text-2xl font-black uppercase mb-2">Goal Tracker</h3>
                        <p className="opacity-80">Coming Soon - Track your financial goals</p>
                    </div>
                );

            case 'bill-splitter':
                return (
                    <div key={widgetId} className="bg-gradient-to-br from-banky-purple to-banky-blue border-4 border-ink p-8 shadow-neo text-center text-white">
                        <h3 className="text-2xl font-black uppercase mb-2">Bill Splitter</h3>
                        <p className="opacity-80">Access via Dashboard tabs above</p>
                    </div>
                );

            case 'dreamboard':
                return (
                    <div key={widgetId} className="bg-gradient-to-br from-banky-pink to-banky-yellow border-4 border-ink p-8 shadow-neo text-center text-ink">
                        <h3 className="text-2xl font-black uppercase mb-2">Dream Board</h3>
                        <p className="opacity-80">Access via Dashboard tabs above</p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {enabledWidgets.map((widget) => renderWidget(widget.id, widget.type))}

            {enabledWidgets.length === 0 && (
                <div className="col-span-full bg-gray-100 border-4 border-dashed border-gray-300 p-12 text-center">
                    <p className="text-xl font-black text-gray-400 uppercase">No widgets enabled</p>
                    <p className="text-gray-500 mt-2">Click the widget library button to add widgets</p>
                </div>
            )}
            {/* Add Widget Card */}
            {onAddWidget && (
                <div
                    onClick={onAddWidget}
                    className="bg-gray-50 border-4 border-dashed border-gray-300 p-6 min-h-[150px] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white hover:border-ink hover:border-4 transition-all group"
                >
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4 group-hover:bg-banky-yellow group-hover:text-ink transition-colors">
                        <span className="text-2xl font-black text-gray-400 group-hover:text-ink">+</span>
                    </div>
                    <h3 className="text-lg font-black uppercase text-gray-400 group-hover:text-ink transition-colors">Add Widget</h3>
                </div>
            )}
        </div>
    );
};

export default WidgetGrid;
