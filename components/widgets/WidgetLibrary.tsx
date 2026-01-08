import React, { useState } from 'react';
import { X, Plus, Check, Sparkles, TrendingUp, Target, Users, Heart, BarChart3 } from 'lucide-react';
import { useWidgets, WidgetType } from '../../context/WidgetContext';

interface WidgetLibraryProps {
    onClose: () => void;
}

interface WidgetDefinition {
    type: WidgetType;
    name: string;
    description: string;
    icon: React.ReactNode;
    category: 'ai' | 'financial' | 'goals' | 'social';
    available: boolean;
}

const WIDGET_DEFINITIONS: WidgetDefinition[] = [
    {
        type: 'flash-cards',
        name: 'Flash Cards',
        description: 'Quick add expenses and income',
        icon: <TrendingUp className="w-6 h-6" />,
        category: 'financial',
        available: true,
    },
    {
        type: 'recent-moves',
        name: 'Recent Moves',
        description: 'Latest transactions at a glance',
        icon: <BarChart3 className="w-6 h-6" />,
        category: 'financial',
        available: true,
    },
    {
        type: 'quick-stats',
        name: 'Quick Stats',
        description: 'Financial overview cards',
        icon: <BarChart3 className="w-6 h-6" />,
        category: 'financial',
        available: true,
    },
    {
        type: 'ai-insights',
        name: 'AI Insights',
        description: 'Smart financial tips from AI',
        icon: <Sparkles className="w-6 h-6" />,
        category: 'ai',
        available: false, // Coming soon
    },
    {
        type: 'spending-heatmap',
        name: 'Spending Heatmap',
        description: 'Visual spending patterns',
        icon: <BarChart3 className="w-6 h-6" />,
        category: 'financial',
        available: false,
    },
    {
        type: 'goal-tracker',
        name: 'Goal Tracker',
        description: 'Track your dream board goals',
        icon: <Target className="w-6 h-6" />,
        category: 'goals',
        available: false,
    },
    {
        type: 'bill-splitter',
        name: 'Bill Splitter',
        description: 'Quick access to bill splitting',
        icon: <Users className="w-6 h-6" />,
        category: 'social',
        available: false,
    },
    {
        type: 'dreamboard',
        name: 'Dream Board',
        description: 'Your financial aspirations',
        icon: <Heart className="w-6 h-6" />,
        category: 'goals',
        available: false,
    },
];

/**
 * WidgetLibrary - Modal showing all available widgets
 * Users can add/remove widgets from their dashboard
 */
const WidgetLibrary: React.FC<WidgetLibraryProps> = ({ onClose }) => {
    const { widgets, addWidget, removeWidget } = useWidgets();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const categories = [
        { id: 'all', label: 'All' },
        { id: 'ai', label: 'AI Powered' },
        { id: 'financial', label: 'Financial' },
        { id: 'goals', label: 'Goals' },
        { id: 'social', label: 'Social' },
    ];

    const filteredWidgets = selectedCategory === 'all'
        ? WIDGET_DEFINITIONS
        : WIDGET_DEFINITIONS.filter(w => w.category === selectedCategory);

    const isWidgetAdded = (type: WidgetType) => {
        return widgets.some(w => w.type === type && w.enabled);
    };

    const handleToggleWidget = (type: WidgetType) => {
        if (!WIDGET_DEFINITIONS.find(w => w.type === type)?.available) {
            return; // Widget not available yet
        }

        if (isWidgetAdded(type)) {
            const widget = widgets.find(w => w.type === type);
            if (widget) {
                removeWidget(widget.id);
            }
        } else {
            addWidget(type);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white border-4 border-ink shadow-neo max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-ink text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-banky-yellow" />
                        <h2 className="text-2xl font-black uppercase font-display">Widget Library</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Category Tabs */}
                <div className="border-b-4 border-ink flex overflow-x-auto bg-gray-50">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-6 py-3 font-black uppercase text-sm transition-colors whitespace-nowrap ${selectedCategory === cat.id
                                    ? 'bg-banky-yellow text-ink border-b-4 border-ink -mb-1'
                                    : 'text-gray-400 hover:text-ink'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Widget Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredWidgets.map((widget) => {
                            const added = isWidgetAdded(widget.type);
                            const available = widget.available;

                            return (
                                <div
                                    key={widget.type}
                                    className={`border-2 border-ink p-4 transition-all ${added
                                            ? 'bg-banky-green shadow-neo'
                                            : available
                                                ? 'bg-white hover:shadow-neo-sm hover:-translate-y-1'
                                                : 'bg-gray-100 opacity-60'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`p-2 border-2 border-ink ${added ? 'bg-white' : 'bg-banky-yellow'}`}>
                                            {widget.icon}
                                        </div>
                                        <button
                                            onClick={() => handleToggleWidget(widget.type)}
                                            disabled={!available}
                                            className={`p-2 border-2 border-ink transition-all ${added
                                                    ? 'bg-white text-banky-green hover:bg-red-500 hover:text-white'
                                                    : available
                                                        ? 'bg-ink text-white hover:bg-banky-yellow hover:text-ink'
                                                        : 'bg-gray-300 text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            {added ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <h3 className="font-black uppercase text-lg mb-1">{widget.name}</h3>
                                    <p className="text-sm text-gray-600">{widget.description}</p>
                                    {!available && (
                                        <p className="text-xs font-bold text-banky-purple mt-2 uppercase">Coming Soon</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t-4 border-ink px-6 py-4 bg-gray-50 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        <span className="font-bold">{widgets.filter(w => w.enabled).length}</span> widgets active
                    </p>
                    <button
                        onClick={onClose}
                        className="bg-ink text-white px-6 py-2 border-2 border-ink font-black uppercase shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WidgetLibrary;
