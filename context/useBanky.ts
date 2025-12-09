import { createContext, useContext } from 'react';
import { Transaction, Account, Budget, Category, UserProfile, Currency, Goal, Theme, RegionCode, Group, Member, Expense, UserState } from '../types';

export interface BankyContextType {
    user: UserProfile | null;
    isLoading: boolean;
    transactions: Transaction[];
    accounts: Account[];
    budgets: Budget[];
    goals: Goal[];
    groups: Group[];
    userState: UserState;
    currency: Currency;
    theme: Theme;
    region: RegionCode;
    toggleTheme: () => void;
    addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    createAccount: (acc: Omit<Account, 'id'>, preferredCurrency?: Currency) => Promise<{ error: any }>;
    deleteAccount: (id: string) => Promise<void>;
    updateBudget: (category: Category, limit: number) => Promise<void>;
    addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
    updateGoal: (id: string, savedAmount: number) => Promise<void>;
    deleteGoal: (id: string) => Promise<void>;
    addXp: (amount: number) => Promise<void>;
    unlockReward: (item: string) => Promise<void>;
    markUnitComplete: (unitId: string) => Promise<void>;
    setCurrency: (c: Currency) => Promise<void>;
    updateUserName: (name: string) => Promise<void>;
    completeOnboarding: () => Promise<void>;
    login: (rememberMe?: boolean, devUser?: any) => Promise<void>;
    logout: () => Promise<void>;
    addGroup: (name: string, members: Member[]) => Promise<void>;
    addExpense: (groupId: string, expense: Omit<Expense, 'id'>) => Promise<void>;
    deleteGroup: (groupId: string) => Promise<void>;
    deleteExpense: (groupId: string, expenseId: string) => Promise<void>;
    showDailyBonus: boolean;
    closeDailyBonus: () => void;
    checkDailyBonus: (userId: string, lastBonusDate: string | null, streak: number) => Promise<void>;
    refreshProfile: () => Promise<void>;
}

export const BankyContext = createContext<BankyContextType | undefined>(undefined);

export const useBanky = () => {
    const context = useContext(BankyContext);
    if (!context) throw new Error("useBanky must be used within a BankyProvider");
    return context;
};
