import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Currency, Theme, RegionCode } from '../types';
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from '../constants';

interface SettingsContextType {
    // Theme
    theme: Theme;
    toggleTheme: () => void;

    // Currency
    currency: Currency;
    setCurrency: (code: string) => void;

    // Region
    region: RegionCode;
    setRegion: (r: RegionCode) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
    children: ReactNode;
    userId?: string | null;
}

/**
 * SettingsProvider manages user preferences: theme, currency, and region.
 * These are persisted to localStorage per-user for logged-in users,
 * or globally for anonymous users.
 */
export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children, userId }) => {
    // Initialize theme from localStorage
    const [theme, setTheme] = useState<Theme>(() => {
        if (userId) {
            return (localStorage.getItem(`banky_theme_${userId}`) as Theme) || 'light';
        }
        return (localStorage.getItem('banky_theme_pref') as Theme) || 'light';
    });

    // Initialize currency from localStorage
    const [currency, setCurrencyState] = useState<Currency>(() => {
        if (userId) {
            const saved = localStorage.getItem(`banky_currency_${userId}`);
            if (saved) {
                const found = SUPPORTED_CURRENCIES.find(c => c.code === saved);
                if (found) return found;
            }
        }
        return DEFAULT_CURRENCY;
    });

    // Initialize region from localStorage
    const [region, setRegionState] = useState<RegionCode>(() => {
        if (userId) {
            return (localStorage.getItem(`banky_region_${userId}`) as RegionCode) || 'Global';
        }
        return 'Global';
    });

    // Apply theme to document body
    useEffect(() => {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // Persist theme
        if (userId) {
            localStorage.setItem(`banky_theme_${userId}`, theme);
        }
        localStorage.setItem('banky_theme_pref', theme);
    }, [theme, userId]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const setCurrency = (code: string) => {
        const found = SUPPORTED_CURRENCIES.find(c => c.code === code);
        if (found) {
            setCurrencyState(found);
            if (userId) {
                localStorage.setItem(`banky_currency_${userId}`, code);
            }
        }
    };

    const setRegion = (r: RegionCode) => {
        setRegionState(r);
        if (userId) {
            localStorage.setItem(`banky_region_${userId}`, r);
        }
    };

    return (
        <SettingsContext.Provider value={{
            theme,
            toggleTheme,
            currency,
            setCurrency,
            region,
            setRegion
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

/**
 * Hook to access settings context.
 * Must be used within a SettingsProvider.
 */
export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export { SettingsContext };
