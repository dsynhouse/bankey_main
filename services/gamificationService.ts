import { SupabaseClient } from '@supabase/supabase-js';

export const calculateLevel = (xp: number) => {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
};

export const addXpService = async (
    supabase: SupabaseClient | null,
    userId: string,
    currentXp: number,
    amount: number
): Promise<{ newXp: number; newLevel: number }> => {
    const newXp = currentXp + amount;
    const newLevel = calculateLevel(newXp);

    if (supabase) {
        await supabase.from('profiles').update({ total_xp: newXp, level: newLevel }).eq('id', userId);
    }

    return { newXp, newLevel };
};
