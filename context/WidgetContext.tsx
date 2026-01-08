import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type WidgetType =
    | 'flash-cards'
    | 'recent-moves'
    | 'quick-stats'
    | 'ai-insights'
    | 'spending-heatmap'
    | 'goal-tracker'
    | 'bill-splitter'
    | 'dreamboard';

export interface WidgetConfig {
    id: string;
    type: WidgetType;
    position: number;
    enabled: boolean;
    config?: Record<string, unknown>;
}

interface WidgetContextType {
    widgets: WidgetConfig[];
    enabledWidgets: WidgetConfig[];
    addWidget: (type: WidgetType) => void;
    removeWidget: (id: string) => void;
    reorderWidgets: (widgetIds: string[]) => void;
    toggleWidget: (id: string) => void;
    resetToDefault: () => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

const DEFAULT_WIDGETS: WidgetConfig[] = [
    { id: 'flash-cards-1', type: 'flash-cards', position: 0, enabled: true },
    { id: 'recent-moves-1', type: 'recent-moves', position: 1, enabled: true },
    { id: 'quick-stats-1', type: 'quick-stats', position: 2, enabled: true },
];

const STORAGE_KEY = 'bankey_widget_layout';

export const WidgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
        // Load from localStorage
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load widget layout:', error);
        }
        return DEFAULT_WIDGETS;
    });

    // Save to localStorage whenever widgets change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
        } catch (error) {
            console.error('Failed to save widget layout:', error);
        }
    }, [widgets]);

    const enabledWidgets = widgets.filter(w => w.enabled).sort((a, b) => a.position - b.position);

    const addWidget = useCallback((type: WidgetType) => {
        const newWidget: WidgetConfig = {
            id: `${type}-${Date.now()}`,
            type,
            position: widgets.length,
            enabled: true,
        };
        setWidgets(prev => [...prev, newWidget]);
    }, [widgets.length]);

    const removeWidget = useCallback((id: string) => {
        setWidgets(prev => prev.filter(w => w.id !== id));
    }, []);

    const reorderWidgets = useCallback((widgetIds: string[]) => {
        setWidgets(prev => {
            const newWidgets = [...prev];
            widgetIds.forEach((id, index) => {
                const widget = newWidgets.find(w => w.id === id);
                if (widget) {
                    widget.position = index;
                }
            });
            return newWidgets;
        });
    }, []);

    const toggleWidget = useCallback((id: string) => {
        setWidgets(prev =>
            prev.map(w => (w.id === id ? { ...w, enabled: !w.enabled } : w))
        );
    }, []);

    const resetToDefault = useCallback(() => {
        setWidgets(DEFAULT_WIDGETS);
    }, []);

    return (
        <WidgetContext.Provider
            value={{
                widgets,
                enabledWidgets,
                addWidget,
                removeWidget,
                reorderWidgets,
                toggleWidget,
                resetToDefault,
            }}
        >
            {children}
        </WidgetContext.Provider>
    );
};

export const useWidgets = () => {
    const context = useContext(WidgetContext);
    if (!context) {
        throw new Error('useWidgets must be used within WidgetProvider');
    }
    return context;
};
