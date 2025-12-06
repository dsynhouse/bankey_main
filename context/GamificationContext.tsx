import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { UserState } from '../types';
import { INITIAL_USER_STATE } from '../constants';
import { supabase } from '../services/supabase';
import confetti from 'canvas-confetti';

interface GamificationContextType {
    // State
    userState: UserState;
    showDailyBonus: boolean;

    // Actions
    addXp: (amount: number) => Promise<void>;
    unlockReward: (item: string) => Promise<void>;
    markUnitComplete: (unitId: string) => Promise<void>;
    closeDailyBonus: () => void;

    // Internal (for BankyContext to sync)
    setUserState: React.Dispatch<React.SetStateAction<UserState>>;
    checkDailyBonus: (userId: string, lastBonusDate: string | null, currentStreak: number) => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

interface GamificationProviderProps {
    children: ReactNode;
    userId?: string | null;
}

/**
 * GamificationProvider manages XP, levels, streaks, rewards, and daily bonuses.
 */
export const GamificationProvider: React.FC<GamificationProviderProps> = ({ children, userId }) => {
    const [userState, setUserState] = useState<UserState>(INITIAL_USER_STATE);
    const [showDailyBonus, setShowDailyBonus] = useState(false);

    const closeDailyBonus = useCallback(() => {
        setShowDailyBonus(false);
    }, []);

    const addXp = useCallback(async (amount: number) => {
        if (!userId || !supabase) return;

        setUserState(prev => {
            const newXp = prev.totalXp + amount;
            const newLevel = Math.floor(newXp / 100) + 1;
            return { ...prev, totalXp: newXp, level: newLevel };
        });

        // Persist to database
        const newXp = userState.totalXp + amount;
        const newLevel = Math.floor(newXp / 100) + 1;

        await supabase.from('profiles').update({
            total_xp: newXp,
            level: newLevel
        }).eq('id', userId);
    }, [userId, userState.totalXp]);

    const unlockReward = useCallback(async (item: string) => {
        if (!userId || !supabase) return;

        setUserState(prev => ({
            ...prev,
            inventory: [...prev.inventory, item]
        }));

        await supabase.from('profiles').update({
            inventory: [...userState.inventory, item]
        }).eq('id', userId);
    }, [userId, userState.inventory]);

    const markUnitComplete = useCallback(async (unitId: string) => {
        if (!userId || !supabase) return;

        if (userState.completedUnitIds.includes(unitId)) return;

        setUserState(prev => ({
            ...prev,
            completedUnitIds: [...prev.completedUnitIds, unitId]
        }));

        await supabase.from('profiles').update({
            completed_unit_ids: [...userState.completedUnitIds, unitId]
        }).eq('id', userId);
    }, [userId, userState.completedUnitIds]);

    const checkDailyBonus = useCallback(async (
        checkUserId: string,
        lastBonusDate: string | null,
        currentStreak: number
    ) => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        // Check localStorage first (double-lock)
        const localLastBonus = localStorage.getItem(`banky_last_bonus_${checkUserId}`);
        if (localLastBonus === todayStr) return;

        // If already claimed today from DB
        if (lastBonusDate === todayStr) return;

        // Calculate streak
        let newStreak = 1;
        if (lastBonusDate) {
            const yesterdayStr = new Date(now.getTime() - 24 * 60 * 60 * 1000)
                .toISOString().split('T')[0];

            if (lastBonusDate === yesterdayStr) {
                newStreak = currentStreak + 1;
            }
        }

        // Calculate bonus XP
        const bonusXp = Math.min(10 + (newStreak - 1) * 5, 50);

        // Update state
        setUserState(prev => ({
            ...prev,
            streakDays: newStreak,
            totalXp: prev.totalXp + bonusXp,
            level: Math.floor((prev.totalXp + bonusXp) / 100) + 1,
            lastBonusDate: todayStr
        }));

        setShowDailyBonus(true);

        // Confetti!
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        // Persist
        localStorage.setItem(`banky_last_bonus_${checkUserId}`, todayStr);

        if (supabase) {
            await supabase.from('profiles').update({
                last_bonus_date: todayStr,
                streak_days: newStreak,
                total_xp: userState.totalXp + bonusXp,
                level: Math.floor((userState.totalXp + bonusXp) / 100) + 1
            }).eq('id', checkUserId);
        }
    }, [userState.totalXp]);

    return (
        <GamificationContext.Provider value={{
            userState,
            showDailyBonus,
            addXp,
            unlockReward,
            markUnitComplete,
            closeDailyBonus,
            setUserState,
            checkDailyBonus
        }}>
            {children}
        </GamificationContext.Provider>
    );
};

/**
 * Hook to access gamification context.
 */
export const useGamification = (): GamificationContextType => {
    const context = useContext(GamificationContext);
    if (!context) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
};

export { GamificationContext };
