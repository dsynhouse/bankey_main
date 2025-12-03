import { SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { Transaction, Account, AccountType } from '../types';

// Helper to create default account
export const createDefaultAccount = async (
    supabase: SupabaseClient,
    userId: string,
    currencyCode: string
): Promise<{ account: Account | null; error: PostgrestError | null }> => {
    const id = crypto.randomUUID();
    const newAccount: Account = {
        id,
        name: 'Main Wallet',
        type: AccountType.SPENDING,
        balance: 0,
        currency: currencyCode,
        color: 'bg-banky-pink'
    };

    const { error } = await supabase.from('accounts').insert({
        id,
        user_id: userId,
        name: newAccount.name,
        type: newAccount.type,
        balance: newAccount.balance,
        currency: newAccount.currency,
        color: newAccount.color
    });

    return { account: error ? null : newAccount, error };
};

export const saveTransaction = async (
    supabase: SupabaseClient,
    userId: string,
    transaction: Transaction
): Promise<{ error: PostgrestError | null }> => {
    const { error } = await supabase.from('transactions').insert({
        id: transaction.id,
        user_id: userId,
        account_id: transaction.accountId,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        type: transaction.type,
        date: transaction.date
    });
    return { error };
};

export const updateAccountBalance = async (
    supabase: SupabaseClient,
    accountId: string,
    newBalance: number
): Promise<{ error: PostgrestError | null }> => {
    const { error } = await supabase.from('accounts').update({ balance: newBalance }).eq('id', accountId);
    return { error };
};
