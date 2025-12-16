import React, { useState, useEffect, createContext, useContext } from 'react';
import { Currency, Theme, RegionCode, UserProfile } from '../types';
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from '../constants';

interface PreferencesContextValue {
    // Theme
    theme: Theme;
    toggleTheme: () => void;

    // Currency
    currency: Currency;
    setCurrency: (c: Currency) => void;

    // Region
    region: RegionCode;
    setRegion: (r: RegionCode) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export const usePreferences = () => {
    const context = useContext(PreferencesContext);
    if (!context) {
        throw new Error('usePreferences must be used within PreferencesProvider');
    }
    return context;
};

interface PreferencesProviderProps {
    children: React.ReactNode;
    user?: UserProfile | null;
}

export const PreferencesProvider: React.FC<PreferencesProviderProps> = ({ children, user }) => {
    const [theme, setTheme] = useState<Theme>('light');
    const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);
    const [region, setRegionState] = useState<RegionCode>('Global');

    // --- THEME PERSISTENCE ---
    useEffect(() => {
        if (user) {
            const savedTheme = localStorage.getItem(`banky_theme_${user.id}`) as Theme;
            if (savedTheme) setTheme(savedTheme);

            const savedRegion = localStorage.getItem(`banky_region_${user.id}`) as RegionCode;
            if (savedRegion) setRegionState(savedRegion);
        } else {
            const savedTheme = localStorage.getItem('banky_theme_pref') as Theme;
            if (savedTheme) setTheme(savedTheme);
        }
    }, [user]);

    useEffect(() => {
        document.body.classList.toggle('dark-mode', theme === 'dark');

        if (user) {
            localStorage.setItem(`banky_theme_${user.id}`, theme);
        }
        localStorage.setItem('banky_theme_pref', theme);
    }, [theme, user]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    // --- CURRENCY HELPERS ---
    const hydrateCurrency = (code: string) => {
        const found = SUPPORTED_CURRENCIES.find(c => c.code === code);
        if (found) setCurrencyState(found);
    };

    const setCurrency = (c: Currency) => {
        setCurrencyState(c);
    };

    const setRegion = (r: RegionCode) => {
        setRegionState(r);
        if (user) {
            localStorage.setItem(`banky_region_${user.id}`, r);
        }
    };

    // Hydrate currency from user profile on mount
    useEffect(() => {
        if (user && (user as any).currencyCode) {
            hydrateCurrency((user as any).currencyCode);
        }
    }, [user]);

    const value: PreferencesContextValue = {
        theme,
        toggleTheme,
        currency,
        setCurrency,
        region,
        setRegion
    };

    return (
        <PreferencesContext.Provider value={value}>
            {children}
        </PreferencesContext.Provider>
    );
};
