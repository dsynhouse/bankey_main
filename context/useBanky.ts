import { createContext, useContext } from 'react';
import { BankyContextType } from '../types';

export const BankyContext = createContext<BankyContextType | undefined>(undefined);

export const useBanky = () => {
    const context = useContext(BankyContext);
    if (!context) throw new Error("useBanky must be used within a BankyProvider");
    return context;
};
