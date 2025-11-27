import { createContext, useContext } from 'react';

export interface FeatureFlags {
    enableNewDashboard: boolean;
    enableAdvancedReports: boolean;
    enableAiAdvisor: boolean;
}

export const DEFAULT_FLAGS: FeatureFlags = {
    enableNewDashboard: false,
    enableAdvancedReports: false,
    enableAiAdvisor: true,
};

export interface FeatureFlagContextType {
    flags: FeatureFlags;
    setFlag: (key: keyof FeatureFlags, value: boolean) => void;
}

export const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export const useFeatureFlags = () => {
    const context = useContext(FeatureFlagContext);
    if (!context) throw new Error("useFeatureFlags must be used within a FeatureFlagProvider");
    return context;
};
