import React from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PremiumBadgeProps {
    size?: 'small' | 'medium' | 'large';
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({ size = 'small' }) => {
    const sizeClasses = {
        small: 'text-xs px-2 py-0.5',
        medium: 'text-sm px-3 py-1',
        large: 'text-base px-4 py-2'
    };

    return (
        <span
            className={`
        inline-flex items-center gap-1 
        bg-gradient-to-r from-yellow-400 to-orange-500 
        text-white font-semibold rounded-full
        ${sizeClasses[size]}
      `}
        >
            <Sparkles size={size === 'small' ? 12 : size === 'medium' ? 14 : 16} />
            Premium
        </span>
    );
};

interface PremiumLockProps {
    featureName: string;
    description: string;
    icon?: React.ReactNode;
}

export const PremiumLock: React.FC<PremiumLockProps> = ({
    featureName,
    description,
    icon
}) => {
    const navigate = useNavigate();

    return (
        <div className="premium-lock-overlay">
            <div className="premium-lock-content">
                {icon || <Lock size={64} className="text-gray-400 mb-4" />}

                <h2 className="text-2xl font-bold mb-2">{featureName}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md text-center">
                    {description}
                </p>

                <div className="mb-6">
                    <PremiumBadge size="large" />
                    <p className="text-sm text-gray-500 mt-2">Available with Premium - ₹149/month</p>
                </div>

                <button
                    onClick={() => navigate('/settings?tab=premium')}
                    className="
            px-8 py-3 
            bg-gradient-to-r from-yellow-400 to-orange-500 
            text-white font-semibold rounded-lg 
            hover:from-yellow-500 hover:to-orange-600 
            transition-all transform hover:scale-105
            shadow-lg
          "
                >
                    Upgrade to Premium
                </button>

                <p className="text-xs text-gray-400 mt-4">
                    Cancel anytime • No commitment
                </p>
            </div>

            <style>{`
        .premium-lock-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          border-radius: 12px;
        }

        .dark .premium-lock-overlay {
          background: rgba(0, 0, 0, 0.85);
        }

        .premium-lock-content {
          text-align: center;
          padding: 2rem;
          max-width: 500px;
        }
      `}</style>
        </div>
    );
};

interface ComingSoonBadgeProps {
    className?: string;
}

export const ComingSoonBadge: React.FC<ComingSoonBadgeProps> = ({ className = '' }) => {
    return (
        <span
            className={`
        inline-flex items-center gap-1
        bg-blue-500 text-white
        text-xs font-semibold px-2 py-1 rounded-full
        ${className}
      `}
        >
            Coming Soon
        </span>
    );
};
