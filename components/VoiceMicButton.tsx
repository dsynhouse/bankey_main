import React from 'react';
import { Mic } from 'lucide-react';
import { usePremium } from '../context/usePremium';

interface VoiceMicButtonProps {
    onClick: () => void;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'inline' | 'icon';
    className?: string;
    disabled?: boolean;
}

/**
 * Compact inline mic button for voice input
 * Designed to be embedded within forms alongside other buttons
 */
const VoiceMicButton: React.FC<VoiceMicButtonProps> = ({
    onClick,
    size = 'md',
    variant = 'default',
    className = '',
    disabled = false
}) => {
    const { isPremium } = usePremium();

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12'
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    const variantClasses = {
        default: 'bg-gradient-to-br from-banky-purple to-banky-pink text-white border-2 border-ink shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5',
        inline: 'bg-banky-purple text-white border-2 border-ink hover:bg-banky-pink',
        icon: 'bg-transparent text-banky-purple hover:text-banky-pink hover:bg-banky-purple/10'
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={isPremium ? "Voice Input" : "Voice Input (Premium)"}
            className={`
                ${sizeClasses[size]}
                ${variantClasses[variant]}
                rounded-full flex items-center justify-center
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                relative group
                ${className}
            `}
        >
            <Mic className={iconSizes[size]} />

            {/* Premium badge for non-premium users */}
            {!isPremium && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 border border-ink rounded-full flex items-center justify-center text-[8px] font-black">
                    ⭐
                </span>
            )}
        </button>
    );
};

export default VoiceMicButton;
