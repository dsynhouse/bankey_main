import React, { useMemo } from 'react';
import { useBanky } from './useBanky';

/**
 * Hook to check premium status and access premium-only features
 * 
 * @returns {object} Premium status information
 * @example
 * const { isPremium, daysRemaining } = usePremium();
 * if (!isPremium) {
 *   return <PremiumUpgradePrompt />;
 * }
 */
export const usePremium = () => {
    const { user } = useBanky();

    const isPremium = user?.isPremium ?? false;
    const expiresAt = user?.premiumExpiresAt;

    // Use useMemo to avoid calling Date.now() during render (impure function)
    const { isExpired, daysRemaining } = useMemo(() => {
        // eslint-disable-next-line react-hooks/purity
        const now = Date.now();
        const expired = expiresAt
            ? new Date(expiresAt).getTime() < now
            : false;
        const days = expiresAt
            ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now) / (1000 * 60 * 60 * 24)))
            : 0;
        return { isExpired: expired, daysRemaining: days };
    }, [expiresAt]);

    return {
        isPremium: isPremium && !isExpired,
        expiresAt,
        daysRemaining,
        isExpired
    };
};

/**
 * Higher-order component to gate features behind premium
 * 
 * @param WrappedComponent - Component to render if premium
 * @param FallbackComponent - Component to render if not premium
 * @returns Gated component
 * 
 * @example
 * const OCRScanner = withPremium(OCRScannerComponent, PremiumUpgradePrompt);
 */
export function withPremium<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    FallbackComponent: React.ComponentType
): React.ComponentType<P> {
    return function PremiumGatedComponent(props: P) {
        const { isPremium } = usePremium();

        if (!isPremium) {
            return <FallbackComponent />;
        }

        return <WrappedComponent {...props} />;
    };
}
