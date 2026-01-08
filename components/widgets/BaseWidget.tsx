import React from 'react';
import { GripVertical, Maximize2, Minimize2, RefreshCw } from 'lucide-react';

interface BaseWidgetProps {
    title: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
    headerAction?: React.ReactNode;
    onRefresh?: () => void;
    isLoading?: boolean;
    className?: string;
    draggableId?: string;
}

/**
 * BaseWidget - Reusable wrapper for all dashboard widgets
 * Provides consistent styling, header, and optional loading/refresh capabilities
 */
const BaseWidget: React.FC<BaseWidgetProps> = ({
    title,
    children,
    icon,
    headerAction,
    onRefresh,
    isLoading = false,
    className = '',
}) => {
    const [isMinimized, setIsMinimized] = React.useState(false);

    return (
        <div className={`bg-white border-4 border-ink shadow-neo overflow-hidden flex flex-col ${className}`}>
            {/* Widget Header */}
            <div className="bg-ink text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Drag Handle - hidden for now, will be used when drag-drop is implemented */}
                    <div className="hidden cursor-grab active:cursor-grabbing text-white/50 hover:text-white">
                        <GripVertical className="w-4 h-4" />
                    </div>

                    {icon && <div className="text-banky-yellow">{icon}</div>}
                    <h3 className="font-black uppercase text-sm tracking-wide">{title}</h3>
                </div>

                <div className="flex items-center gap-2">
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            disabled={isLoading}
                            className="p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
                            aria-label="Refresh widget"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    )}

                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        aria-label={isMinimized ? 'Maximize widget' : 'Minimize widget'}
                    >
                        {isMinimized ? (
                            <Maximize2 className="w-4 h-4" />
                        ) : (
                            <Minimize2 className="w-4 h-4" />
                        )}
                    </button>

                    {headerAction}
                </div>
            </div>

            {/* Widget Content */}
            {!isMinimized && (
                <div className="p-4 flex-1 overflow-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <RefreshCw className="w-8 h-8 animate-spin text-banky-purple" />
                        </div>
                    ) : (
                        children
                    )}
                </div>
            )}
        </div>
    );
};

export default BaseWidget;
