import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Group, Member, Expense } from '../types';
import { supabase } from '../services/supabase';
import {
    getGroups,
    createGroup as createGroupService,
    addExpense as addExpenseService,
    updateMemberBalance,
    deleteGroup as deleteGroupService,
    deleteExpense as deleteExpenseService
} from '../services/billSplitterService';

interface BillSplitterContextType {
    groups: Group[];
    addGroup: (name: string, members: Member[]) => void;
    addExpense: (groupId: string, expense: Omit<Expense, 'id'>) => void;
    settleDebt: (groupId: string, fromId: string, toId: string, amount: number) => void;
    deleteGroup: (groupId: string) => Promise<void>;
    deleteExpense: (groupId: string, expenseId: string) => Promise<void>;
    loadGroups: (userId: string) => Promise<void>;
}

const BillSplitterContext = createContext<BillSplitterContextType | undefined>(undefined);

interface BillSplitterProviderProps {
    children: ReactNode;
    userId?: string | null;
}

/**
 * BillSplitterProvider manages group expenses and debt settlements.
 */
export const BillSplitterProvider: React.FC<BillSplitterProviderProps> = ({ children, userId }) => {
    const [groups, setGroups] = useState<Group[]>([]);

    const loadGroups = useCallback(async (loadUserId: string) => {
        if (!supabase) return;
        const result = await getGroups(supabase, loadUserId);
        setGroups(result.groups || []);
    }, []);

    // Load groups when userId changes
    useEffect(() => {
        let isMounted = true;

        const fetchGroups = async () => {
            if (userId && supabase) {
                const result = await getGroups(supabase, userId);
                if (isMounted) {
                    setGroups(result.groups || []);
                }
            } else {
                setGroups([]);
            }
        };

        fetchGroups();

        return () => {
            isMounted = false;
        };
    }, [userId]);

    const addGroup = useCallback((name: string, members: Member[]) => {
        if (!userId || !supabase) return;

        const newGroup: Group = {
            id: crypto.randomUUID(),
            name,
            members,
            expenses: []
        };

        setGroups(prev => [...prev, newGroup]);
        createGroupService(supabase, userId, newGroup);
    }, [userId]);

    const addExpense = useCallback((groupId: string, expense: Omit<Expense, 'id'>) => {
        if (!userId || !supabase) return;

        const newExpense: Expense = { ...expense, id: crypto.randomUUID() };

        setGroups(prev => prev.map(group => {
            if (group.id !== groupId) return group;

            const updatedExpenses = [...group.expenses, newExpense];
            const updatedMembers = group.members.map(member => {
                const split = newExpense.splitDetails.find(s => s.memberId === member.id);
                const owesAmount = split ? split.amount : 0;
                const paidAmount = member.id === newExpense.paidBy ? newExpense.amount : 0;
                return {
                    ...member,
                    balance: member.balance + paidAmount - owesAmount
                };
            });

            // Persist
            addExpenseService(supabase, userId, groupId, newExpense);
            updatedMembers.forEach(m => updateMemberBalance(supabase, m.id, m.balance));

            return { ...group, expenses: updatedExpenses, members: updatedMembers };
        }));
    }, [userId]);

    const settleDebt = useCallback((groupId: string, fromId: string, toId: string, amount: number) => {
        if (!userId || !supabase) return;

        setGroups(prev => prev.map(group => {
            if (group.id !== groupId) return group;

            const updatedMembers = group.members.map(member => {
                if (member.id === fromId) {
                    return { ...member, balance: member.balance + amount };
                }
                if (member.id === toId) {
                    return { ...member, balance: member.balance - amount };
                }
                return member;
            });

            // Persist
            updatedMembers.forEach(m => updateMemberBalance(supabase, m.id, m.balance));

            return { ...group, members: updatedMembers };
        }));
    }, [userId]);

    const deleteGroupFn = useCallback(async (groupId: string) => {
        if (!userId || !supabase) return;
        setGroups(prev => prev.filter(g => g.id !== groupId));
        await deleteGroupService(supabase, groupId);
    }, [userId]);

    const deleteExpenseFn = useCallback(async (groupId: string, expenseId: string) => {
        if (!userId || !supabase) return;

        setGroups(prev => prev.map(group => {
            if (group.id !== groupId) return group;

            const expenseToDelete = group.expenses.find(e => e.id === expenseId);
            if (!expenseToDelete) return group;

            // Reverse the balance changes
            const updatedMembers = group.members.map(member => {
                const split = expenseToDelete.splitDetails.find(s => s.memberId === member.id);
                const owesAmount = split ? split.amount : 0;
                const paidAmount = member.id === expenseToDelete.paidBy ? expenseToDelete.amount : 0;
                return {
                    ...member,
                    balance: member.balance - paidAmount + owesAmount
                };
            });

            // Persist
            updatedMembers.forEach(m => updateMemberBalance(supabase, m.id, m.balance));
            deleteExpenseService(supabase, expenseId);

            return {
                ...group,
                expenses: group.expenses.filter(e => e.id !== expenseId),
                members: updatedMembers
            };
        }));
    }, [userId]);

    return (
        <BillSplitterContext.Provider value={{
            groups,
            addGroup,
            addExpense,
            settleDebt,
            deleteGroup: deleteGroupFn,
            deleteExpense: deleteExpenseFn,
            loadGroups
        }}>
            {children}
        </BillSplitterContext.Provider>
    );
};

/**
 * Hook to access bill splitter context.
 */
export const useBillSplitter = (): BillSplitterContextType => {
    const context = useContext(BillSplitterContext);
    if (!context) {
        throw new Error('useBillSplitter must be used within a BillSplitterProvider');
    }
    return context;
};

export { BillSplitterContext };
