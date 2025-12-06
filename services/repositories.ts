/**
 * Repository pattern for Supabase database operations.
 * Provides a clean abstraction layer for data access with:
 * - Type-safe operations
 * - Consistent error handling
 * - Easy mocking for tests
 * - Future caching layer support
 */

import { supabase } from './supabase';
import { Transaction, Account, Budget, Goal } from '../types';
import { getErrorMessage } from '../utils';

export interface RepositoryResult<T> {
    data: T | null;
    error: string | null;
}

export interface ListResult<T> {
    data: T[];
    error: string | null;
}

// ============================================
// PROFILE REPOSITORY
// ============================================
export const profileRepository = {
    async getById(userId: string) {
        if (!supabase) return { data: null, error: 'Supabase not initialized' };

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) return { data: null, error: error.message };
            return { data, error: null };
        } catch (e) {
            return { data: null, error: getErrorMessage(e) };
        }
    },

    async update(userId: string, updates: Record<string, unknown>) {
        if (!supabase) return { data: null, error: 'Supabase not initialized' };

        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId)
                .select()
                .single();

            if (error) return { data: null, error: error.message };
            return { data, error: null };
        } catch (e) {
            return { data: null, error: getErrorMessage(e) };
        }
    },

    async upsert(profile: Record<string, unknown>) {
        if (!supabase) return { data: null, error: 'Supabase not initialized' };

        try {
            const { error } = await supabase
                .from('profiles')
                .upsert(profile);

            if (error) return { data: null, error: error.message };
            return { data: profile, error: null };
        } catch (e) {
            return { data: null, error: getErrorMessage(e) };
        }
    }
};

// ============================================
// TRANSACTION REPOSITORY
// ============================================
export const transactionRepository = {
    async getByUserId(userId: string, limit = 100): Promise<ListResult<Transaction>> {
        if (!supabase) return { data: [], error: 'Supabase not initialized' };

        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: false })
                .limit(limit);

            if (error) return { data: [], error: error.message };

            // Map snake_case to camelCase
            const transactions: Transaction[] = (data || []).map(t => ({
                id: t.id,
                date: t.date,
                amount: t.amount,
                category: t.category,
                description: t.description,
                accountId: t.account_id,
                type: t.type
            }));

            return { data: transactions, error: null };
        } catch (e) {
            return { data: [], error: getErrorMessage(e) };
        }
    },

    async create(userId: string, transaction: Omit<Transaction, 'id'>): Promise<RepositoryResult<Transaction>> {
        if (!supabase) return { data: null, error: 'Supabase not initialized' };

        try {
            const { data, error } = await supabase
                .from('transactions')
                .insert({
                    user_id: userId,
                    date: transaction.date,
                    amount: transaction.amount,
                    category: transaction.category,
                    description: transaction.description,
                    account_id: transaction.accountId,
                    type: transaction.type
                })
                .select()
                .single();

            if (error) return { data: null, error: error.message };

            return {
                data: {
                    id: data.id,
                    date: data.date,
                    amount: data.amount,
                    category: data.category,
                    description: data.description,
                    accountId: data.account_id,
                    type: data.type
                },
                error: null
            };
        } catch (e) {
            return { data: null, error: getErrorMessage(e) };
        }
    },

    async delete(transactionId: string): Promise<RepositoryResult<boolean>> {
        if (!supabase) return { data: null, error: 'Supabase not initialized' };

        try {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', transactionId);

            if (error) return { data: null, error: error.message };
            return { data: true, error: null };
        } catch (e) {
            return { data: null, error: getErrorMessage(e) };
        }
    }
};

// ============================================
// ACCOUNT REPOSITORY
// ============================================
export const accountRepository = {
    async getByUserId(userId: string): Promise<ListResult<Account>> {
        if (!supabase) return { data: [], error: 'Supabase not initialized' };

        try {
            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .eq('user_id', userId);

            if (error) return { data: [], error: error.message };

            const accounts: Account[] = (data || []).map(a => ({
                id: a.id,
                name: a.name,
                type: a.type,
                balance: a.balance,
                currency: a.currency,
                color: a.color
            }));

            return { data: accounts, error: null };
        } catch (e) {
            return { data: [], error: getErrorMessage(e) };
        }
    },

    async create(userId: string, account: Omit<Account, 'id'>): Promise<RepositoryResult<Account>> {
        if (!supabase) return { data: null, error: 'Supabase not initialized' };

        try {
            const { data, error } = await supabase
                .from('accounts')
                .insert({
                    user_id: userId,
                    name: account.name,
                    type: account.type,
                    balance: account.balance,
                    currency: account.currency,
                    color: account.color
                })
                .select()
                .single();

            if (error) return { data: null, error: error.message };

            return {
                data: {
                    id: data.id,
                    name: data.name,
                    type: data.type,
                    balance: data.balance,
                    currency: data.currency,
                    color: data.color
                },
                error: null
            };
        } catch (e) {
            return { data: null, error: getErrorMessage(e) };
        }
    },

    async updateBalance(accountId: string, balance: number): Promise<RepositoryResult<boolean>> {
        if (!supabase) return { data: null, error: 'Supabase not initialized' };

        try {
            const { error } = await supabase
                .from('accounts')
                .update({ balance })
                .eq('id', accountId);

            if (error) return { data: null, error: error.message };
            return { data: true, error: null };
        } catch (e) {
            return { data: null, error: getErrorMessage(e) };
        }
    },

    async delete(accountId: string): Promise<RepositoryResult<boolean>> {
        if (!supabase) return { data: null, error: 'Supabase not initialized' };

        try {
            const { error } = await supabase
                .from('accounts')
                .delete()
                .eq('id', accountId);

            if (error) return { data: null, error: error.message };
            return { data: true, error: null };
        } catch (e) {
            return { data: null, error: getErrorMessage(e) };
        }
    }
};

// ============================================
// BUDGET REPOSITORY
// ============================================
export const budgetRepository = {
    async getByUserId(userId: string): Promise<ListResult<Budget>> {
        if (!supabase) return { data: [], error: 'Supabase not initialized' };

        try {
            const { data, error } = await supabase
                .from('budgets')
                .select('*')
                .eq('user_id', userId);

            if (error) return { data: [], error: error.message };

            const budgets: Budget[] = (data || []).map(b => ({
                id: b.id,
                category: b.category,
                limit: b.limit_amount
            }));

            return { data: budgets, error: null };
        } catch (e) {
            return { data: [], error: getErrorMessage(e) };
        }
    },

    async upsert(userId: string, budget: Budget): Promise<RepositoryResult<Budget>> {
        if (!supabase) return { data: null, error: 'Supabase not initialized' };

        try {
            const { data, error } = await supabase
                .from('budgets')
                .upsert({
                    user_id: userId,
                    category: budget.category,
                    limit_amount: budget.limit
                }, { onConflict: 'user_id,category' })
                .select()
                .single();

            if (error) return { data: null, error: error.message };

            return {
                data: {
                    id: data.id,
                    category: data.category,
                    limit: data.limit_amount
                },
                error: null
            };
        } catch (e) {
            return { data: null, error: getErrorMessage(e) };
        }
    }
};

// ============================================
// GOAL REPOSITORY
// ============================================
export const goalRepository = {
    async getByUserId(userId: string): Promise<ListResult<Goal>> {
        if (!supabase) return { data: [], error: 'Supabase not initialized' };

        try {
            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .eq('user_id', userId);

            if (error) return { data: [], error: error.message };

            const goals: Goal[] = (data || []).map(g => ({
                id: g.id,
                title: g.title,
                targetAmount: g.target_amount,
                savedAmount: g.saved_amount,
                emoji: g.emoji,
                deadline: g.deadline
            }));

            return { data: goals, error: null };
        } catch (e) {
            return { data: [], error: getErrorMessage(e) };
        }
    },

    async create(userId: string, goal: Omit<Goal, 'id'>): Promise<RepositoryResult<Goal>> {
        if (!supabase) return { data: null, error: 'Supabase not initialized' };

        try {
            const { data, error } = await supabase
                .from('goals')
                .insert({
                    user_id: userId,
                    title: goal.title,
                    target_amount: goal.targetAmount,
                    saved_amount: goal.savedAmount,
                    emoji: goal.emoji,
                    deadline: goal.deadline
                })
                .select()
                .single();

            if (error) return { data: null, error: error.message };

            return {
                data: {
                    id: data.id,
                    title: data.title,
                    targetAmount: data.target_amount,
                    savedAmount: data.saved_amount,
                    emoji: data.emoji,
                    deadline: data.deadline
                },
                error: null
            };
        } catch (e) {
            return { data: null, error: getErrorMessage(e) };
        }
    },

    async update(goalId: string, savedAmount: number): Promise<RepositoryResult<boolean>> {
        if (!supabase) return { data: null, error: 'Supabase not initialized' };

        try {
            const { error } = await supabase
                .from('goals')
                .update({ saved_amount: savedAmount })
                .eq('id', goalId);

            if (error) return { data: null, error: error.message };
            return { data: true, error: null };
        } catch (e) {
            return { data: null, error: getErrorMessage(e) };
        }
    },

    async delete(goalId: string): Promise<RepositoryResult<boolean>> {
        if (!supabase) return { data: null, error: 'Supabase not initialized' };

        try {
            const { error } = await supabase
                .from('goals')
                .delete()
                .eq('id', goalId);

            if (error) return { data: null, error: error.message };
            return { data: true, error: null };
        } catch (e) {
            return { data: null, error: getErrorMessage(e) };
        }
    }
};
