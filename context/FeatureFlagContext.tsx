
import React, { useState, useEffect } from 'react';
import { useBanky } from './useBanky';
import { FeatureFlags, DEFAULT_FLAGS, FeatureFlagContext } from './useFeatureFlags';

export const FeatureFlagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useBanky();
    const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);

    useEffect(() => {
        // Here we can implement logic to set flags based on user ID (A/B testing)
        // For now, we just use defaults or maybe override for specific users
        if (user) {
            // Example: Enable new dashboard for specific user or based on percentage
            // const bucket = parseInt(user.id.slice(-2), 16) % 100;
            // if (bucket < 50) { ... }
        }
    }, [user]);

    const setFlag = (key: keyof FeatureFlags, value: boolean) => {
        setFlags(prev => ({ ...prev, [key]: value }));
    };

    return (
        <FeatureFlagContext.Provider value={{ flags, setFlag }}>
            {children}
        </FeatureFlagContext.Provider>
    );
};
