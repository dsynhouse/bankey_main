
import { SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { Group, Member, Expense, SplitDetail, Debt } from '../types';

// --- Types for DB Insert/Update ---
// We need to map between app types (camelCase) and DB types (snake_case)
// (Interfaces removed as they were unused and causing lints)

// --- Service Functions ---

export const getGroups = async (supabase: SupabaseClient, userId: string): Promise<{ groups: Group[], error: PostgrestError | null }> => {
    // Fetch all groups for the user
    const { data: dbGroups, error: groupsError } = await supabase
        .from('split_groups')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

    if (groupsError) return { groups: [], error: groupsError };
    if (!dbGroups) return { groups: [], error: null };

    const groups: Group[] = [];

    for (const dbGroup of dbGroups) {
        // Fetch members
        const { data: dbMembers, error: membersError } = await supabase
            .from('split_members')
            .select('*')
            .eq('group_id', dbGroup.id);

        if (membersError) {
            console.error(`Error fetching members for group ${dbGroup.id}:`, membersError);
            continue;
        }

        // Fetch expenses
        const { data: dbExpenses, error: expensesError } = await supabase
            .from('split_expenses')
            .select('*')
            .eq('group_id', dbGroup.id)
            .order('date', { ascending: true });

        if (expensesError) {
            console.error(`Error fetching expenses for group ${dbGroup.id}:`, expensesError);
            continue;
        }

        const members: Member[] = dbMembers.map((m: { id: string; name: string; email?: string; phone?: string; balance: string }) => ({
            id: m.id,
            name: m.name,
            email: m.email,
            phone: m.phone,
            balance: parseFloat(m.balance)
        }));

        const expenses: Expense[] = [];
        for (const dbExp of dbExpenses) {
            // Fetch split details for each expense
            const { data: dbSplits, error: splitsError } = await supabase
                .from('split_details')
                .select('*')
                .eq('expense_id', dbExp.id);

            if (splitsError) {
                console.error(`Error fetching splits for expense ${dbExp.id}:`, splitsError);
                continue;
            }

            expenses.push({
                id: dbExp.id,
                description: dbExp.description,
                amount: parseFloat(dbExp.amount),
                paidBy: dbExp.paid_by,
                date: dbExp.date,
                splitMethod: dbExp.split_method as 'equal' | 'percentage' | 'exact',
                splitDetails: dbSplits.map((s: { member_id: string; amount: string; percentage?: string }) => ({
                    memberId: s.member_id,
                    amount: parseFloat(s.amount),
                    percentage: s.percentage ? parseFloat(s.percentage) : undefined
                }))
            });
        }

        groups.push({
            id: dbGroup.id,
            name: dbGroup.name,
            members,
            expenses
        });
    }

    return { groups, error: null };
};

export const createGroup = async (
    supabase: SupabaseClient,
    userId: string,
    group: Group
): Promise<{ error: PostgrestError | null }> => {
    console.log('[SERVICE] createGroup called:', { groupId: group.id, userId, memberCount: group.members.length });

    // 1. Insert Group
    const { error: groupError } = await supabase.from('split_groups').insert({
        id: group.id,
        user_id: userId,
        name: group.name
    });
    if (groupError) {
        console.error('[SERVICE] ❌ Failed to insert group:', groupError);
        return { error: groupError };
    }
    console.log('[SERVICE] ✅ Group inserted');

    // 2. Insert Members
    const dbMembers = group.members.map(m => ({
        id: m.id,
        group_id: group.id,
        user_id: userId, // Added user_id
        name: m.name,
        email: m.email,
        phone: m.phone,
        balance: m.balance
    }));

    console.log('[SERVICE] Inserting members:', dbMembers.length, 'members');
    const { error: membersError } = await supabase.from('split_members').insert(dbMembers);
    if (membersError) {
        console.error('[SERVICE] ❌ Failed to insert members:', membersError);
        console.error('[SERVICE] Member data:', JSON.stringify(dbMembers, null, 2));
        return { error: membersError };
    }
    console.log('[SERVICE] ✅ Members inserted');

    return { error: null };
};

export const addExpense = async (
    supabase: SupabaseClient,
    userId: string, // Added userId param
    groupId: string,
    expense: Expense
): Promise<{ error: PostgrestError | null }> => {
    // 1. Insert Expense
    const { error: expError } = await supabase.from('split_expenses').insert({
        id: expense.id,
        group_id: groupId,
        user_id: userId, // Added user_id
        description: expense.description,
        amount: expense.amount,
        paid_by: expense.paidBy,
        date: expense.date,
        split_method: expense.splitMethod
    });
    if (expError) return { error: expError };

    // 2. Insert Split Details
    const dbSplits = expense.splitDetails.map(s => ({
        expense_id: expense.id,
        user_id: userId, // Added user_id
        member_id: s.memberId,
        amount: s.amount,
        percentage: s.percentage
    }));

    const { error: splitsError } = await supabase.from('split_details').insert(dbSplits);
    if (splitsError) return { error: splitsError };

    return { error: null };
};

export const updateMemberBalance = async (
    supabase: SupabaseClient,
    memberId: string,
    newBalance: number
): Promise<{ error: PostgrestError | null }> => {
    const { error } = await supabase.from('split_members').update({ balance: newBalance }).eq('id', memberId);
    return { error };
};

export const deleteExpense = async (
    supabase: SupabaseClient,
    expenseId: string
): Promise<{ error: PostgrestError | null }> => {
    // 1. Delete Split Details
    const { error: splitsError } = await supabase.from('split_details').delete().eq('expense_id', expenseId);
    if (splitsError) return { error: splitsError };

    // 2. Delete Expense
    const { error: expError } = await supabase.from('split_expenses').delete().eq('id', expenseId);
    return { error: expError };
};

export const deleteGroup = async (
    supabase: SupabaseClient,
    groupId: string
): Promise<{ error: PostgrestError | null }> => {
    // Robust delete: Manually clean up dependencies to avoid FK violations if cascades aren't set.

    // 1. Get all expenses to delete their details
    const { data: expenses } = await supabase.from('split_expenses').select('id').eq('group_id', groupId);

    if (expenses && expenses.length > 0) {
        const expenseIds = expenses.map(e => e.id);
        const { error: splitsError } = await supabase.from('split_details').delete().in('expense_id', expenseIds);
        if (splitsError) return { error: splitsError };

        const { error: expError } = await supabase.from('split_expenses').delete().eq('group_id', groupId);
        if (expError) return { error: expError };
    }

    // 2. Delete Members
    const { error: membersError } = await supabase.from('split_members').delete().eq('group_id', groupId);
    if (membersError) return { error: membersError };

    // 3. Delete Group
    const { error: groupError } = await supabase.from('split_groups').delete().eq('id', groupId);
    return { error: groupError };
};

// --- Utility Functions (Restored) ---

export const calculateNetBalances = (members: Member[], expenses: Expense[]): { [key: string]: number } => {
    const balances: { [key: string]: number } = {};
    members.forEach(m => balances[m.id] = 0);

    expenses.forEach(expense => {
        const payerId = expense.paidBy;
        const amount = expense.amount;

        // Payer gets positive balance (they are owed money)
        // BUT: We need to subtract their share if they are part of the split.
        // The splitDetails logic handles who "consumed" the value.
        // Net Balance = (Amount Paid) - (Amount Consumed)

        if (balances[payerId] === undefined) balances[payerId] = 0;
        balances[payerId] += amount;

        expense.splitDetails.forEach(split => {
            if (balances[split.memberId] === undefined) balances[split.memberId] = 0;
            balances[split.memberId] -= split.amount;
        });
    });

    return balances;
};

export const simplifyDebts = (netBalances: { [key: string]: number }): Debt[] => {
    const debtors: { id: string, amount: number }[] = [];
    const creditors: { id: string, amount: number }[] = [];

    Object.entries(netBalances).forEach(([id, amount]) => {
        if (amount < -0.01) debtors.push({ id, amount }); // Negative balance = owes money
        else if (amount > 0.01) creditors.push({ id, amount }); // Positive balance = is owed money
    });

    // Sort by magnitude to optimize (optional, but good for stability)
    debtors.sort((a, b) => a.amount - b.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const debts: Debt[] = [];
    let i = 0; // debtor index
    let j = 0; // creditor index

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        // The amount to settle is the minimum of what debtor owes and creditor is owed
        const amount = Math.min(Math.abs(debtor.amount), creditor.amount);

        debts.push({
            from: debtor.id,
            to: creditor.id,
            amount: parseFloat(amount.toFixed(2))
        });

        // Update remaining amounts
        debtor.amount += amount;
        creditor.amount -= amount;

        // Move indices if settled (within rounding error)
        if (Math.abs(debtor.amount) < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    return debts;
};

export const calculateSplits = (
    amount: number,
    memberIds: string[],
    method: 'equal' | 'percentage',
    percentages?: { [id: string]: number }
): SplitDetail[] => {
    const splits: SplitDetail[] = [];

    if (method === 'equal') {
        const splitAmount = parseFloat((amount / memberIds.length).toFixed(2));
        let totalSplit = 0;

        memberIds.forEach((id, index) => {
            let myAmount = splitAmount;
            // Handle rounding difference on last person
            if (index === memberIds.length - 1) {
                myAmount = parseFloat((amount - totalSplit).toFixed(2));
            }
            splits.push({ memberId: id, amount: myAmount });
            totalSplit += myAmount;
        });
    } else if (method === 'percentage' && percentages) {
        let totalSplit = 0;
        memberIds.forEach((id) => {
            const pct = percentages[id] || 0;
            const myAmount = parseFloat((amount * (pct / 100)).toFixed(2));

            // Handle rounding difference on last person (if close to total)
            // Or just trust the calculation? Better to ensure sum = amount.
            // But with percentages, it's tricky if they don't sum to 100 exactly.
            // Assuming validation happens before calling this.

            splits.push({ memberId: id, amount: myAmount, percentage: pct });
            totalSplit += myAmount;
        });

        // Fix rounding on the largest share or last person?
        // Let's fix on the last person for simplicity, ensuring total matches exactly.
        const diff = amount - totalSplit;
        if (Math.abs(diff) > 0.001 && splits.length > 0) {
            splits[splits.length - 1].amount += diff;
            splits[splits.length - 1].amount = parseFloat(splits[splits.length - 1].amount.toFixed(2));
        }
    }

    return splits;
};
