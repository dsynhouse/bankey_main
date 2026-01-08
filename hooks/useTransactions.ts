
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { Transaction } from '../types';

export const TRANSACTION_KEYS = {
    all: ['transactions'] as const,
    lists: () => [...TRANSACTION_KEYS.all, 'list'] as const,
};

// Fetch function
const fetchTransactions = async (userId: string | undefined) => {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

    if (error) throw new Error(error.message);
    return data as Transaction[];
};

export const useTransactions = (userId: string | undefined) => {
    const queryClient = useQueryClient();

    // Query
    const query = useQuery({
        queryKey: TRANSACTION_KEYS.lists(),
        queryFn: () => fetchTransactions(userId),
        enabled: !!userId,
    });

    // Add Mutation
    const addMutation = useMutation({
        mutationFn: async (newTransaction: Omit<Transaction, 'id' | 'user_id'>) => {
            if (!userId) throw new Error("User not authenticated");

            const { data, error } = await supabase
                .from('transactions')
                .insert([{ ...newTransaction, user_id: userId }])
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        },
        onSuccess: () => {
            // Invalidate to refetch
            queryClient.invalidateQueries({ queryKey: TRANSACTION_KEYS.lists() });
        },
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id);

            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TRANSACTION_KEYS.lists() });
        },
    });

    return {
        transactions: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
        addTransaction: addMutation.mutateAsync,
        deleteTransaction: deleteMutation.mutateAsync,
        isAdding: addMutation.isPending,
        isDeleting: deleteMutation.isPending
    };
};
