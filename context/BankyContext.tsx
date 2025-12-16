
import React, { useState, useEffect } from 'react';
import { Transaction, Account, AccountType, UserState, Budget, Category, UserProfile, Currency, Goal, Theme, RegionCode, Group, Member, Expense } from '../types';
import { INITIAL_USER_STATE, SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from '../constants';
import { handleSupabaseError } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import { BASE_MODULES } from '../data/educationData';
import { addXpService } from '../services/gamificationService';
import { createDefaultAccount, saveTransaction, updateAccountBalance } from '../services/transactionService';
import {
    getGroups, createGroup, addExpense as addExpenseService, updateMemberBalance, deleteGroup, deleteExpense
} from '../services/billSplitterService';
import { supabase } from '../services/supabase';

import confetti from 'canvas-confetti';

import { BankyContext } from './useBanky';

export const BankyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // --- AUTH STATE ---
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- DATA STATE ---
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);

    const [userState, setUserState] = useState<UserState>(INITIAL_USER_STATE);

    // --- UI STATE ---
    const [showDailyBonus, setShowDailyBonus] = useState(false);

    const closeDailyBonus = () => {
        setShowDailyBonus(false);
    };


    // --- DAILY BONUS LOGIC (Robust ISO Date Check) ---
    const checkDailyBonus = async (userId: string, lastBonusDate: string | null, currentStreak: number) => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format (UTC)
        // NOTE: Using UTC ensures consistency across devices, though it might reset at a different time than local midnight.

        // 1. Check LocalStorage first (Double-Lock)
        const localLastBonus = localStorage.getItem(`banky_last_bonus_${userId} `);
        if (localLastBonus === todayStr) return;

        // 2. If already claimed today (from DB), do nothing.
        if (lastBonusDate === todayStr) return;

        // 2. Calculate Streak
        let newStreak = 1;
        if (lastBonusDate) {
            const lastDate = new Date(lastBonusDate);
            const todayDate = new Date(todayStr);

            const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // If 1 day difference (consecutive), increment
            if (diffDays === 1) {
                newStreak = currentStreak + 1;
            } else {
                newStreak = 1; // Reset if skipped > 1 day
            }
        }

        // 3. Award Bonus
        const bonusXp = 50 + (Math.min(newStreak, 10) * 10); // Bonus cap

        await addXp(bonusXp);
        setUserState(prev => ({ ...prev, streakDays: newStreak }));
        setShowDailyBonus(true);

        // Save to LocalStorage immediately
        localStorage.setItem(`banky_last_bonus_${userId} `, todayStr);

        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#D4FF00', '#FF90E8', '#00FFA3']
        });

        // 4. Update Database
        if (supabase) {
            const { error } = await supabase.from('profiles').upsert({
                id: userId,
                last_bonus_date: todayStr,
                streak_days: newStreak
            });
            if (error) handleSupabaseError(error, 'checkDailyBonus:updateBonus');
        }
    };

    // --- DATA FETCHING ---
    const fetchData = async (userId: string) => {
        if (!supabase) {
            setIsLoading(false);
            return;
        }

        try {
            // 1. Profile & Preferences
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();

            if (profile) {
                setUserState({
                    totalXp: profile.total_xp || 0,
                    level: profile.level || 1,
                    streakDays: profile.streak_days || 1,
                    completedUnitIds: profile.completed_unit_ids || [],
                    inventory: profile.inventory || [],
                    hasCompletedOnboarding: profile.has_completed_onboarding || false
                });

                // --- RECALCULATE XP & LEVEL (Self-Healing) ---
                // 1. Calculate XP from Modules
                const completedIds = profile.completed_unit_ids || [];
                const moduleXp = completedIds.reduce((acc: number, id: string) => {
                    const mod = BASE_MODULES.find(m => m.id === id);
                    return acc + (mod ? mod.xpReward : 0);
                }, 0);

                // 2. Calculate XP from Transactions (Async fetch count)
                const { count: txCount } = await supabase
                    .from('transactions')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId);

                const txXp = (txCount || 0) * 50;
                const calculatedXp = moduleXp + txXp;
                const calculatedLevel = Math.floor(Math.sqrt(calculatedXp / 100)) + 1;

                // 3. Update State & DB if mismatch
                if (calculatedXp !== profile.total_xp || calculatedLevel !== profile.level) {
                    logger.warn(`XP Mismatch! Fixing... Old: ${profile.total_xp} (Lvl ${profile.level}) -> New: ${calculatedXp} (Lvl ${calculatedLevel})`);

                    setUserState(prev => ({ ...prev, totalXp: calculatedXp, level: calculatedLevel }));

                    await supabase.from('profiles').update({
                        total_xp: calculatedXp,
                        level: calculatedLevel
                    }).eq('id', userId);
                }

                // LocalStorage Override for Onboarding
                const localOnboarding = localStorage.getItem(`banky_onboarding_${userId} `);
                if (localOnboarding === 'true' && !profile.has_completed_onboarding) {
                    setUserState(prev => ({ ...prev, hasCompletedOnboarding: true }));
                    // Try to sync back to DB if it was missed
                    if (supabase) supabase.from('profiles').upsert({ id: userId, has_completed_onboarding: true });
                }
                // Currency now handled by PreferencesContext

                // Sync user name from profile if available
                if (profile.name) {
                    setUser(prev => prev ? { ...prev, name: profile.name } : prev);
                }

                // Sync premium status from profile
                setUser(prev => prev ? {
                    ...prev,
                    isPremium: profile.is_premium || false,
                    premiumExpiresAt: profile.premium_expires_at || undefined
                } : prev);

                // Check Daily Bonus using DB date and streak
                checkDailyBonus(userId, profile.last_bonus_date, profile.streak_days || 1);
            } else {
                // Profile missing? Create one.
                logger.info('Profile not found. Creating default profile...');
                const { error: insertError } = await supabase.from('profiles').upsert({
                    id: userId,
                    total_xp: 0,
                    level: 1,
                    streak_days: 1,
                    has_completed_onboarding: false
                });

                if (insertError) {
                    handleSupabaseError(insertError, 'fetchData:createProfile');
                } else {
                    // Re-fetch or just set default state
                    // We'll let the next reload or state update handle it, but ideally we should set state here.
                    // For now, default state is already set by useState(INITIAL_USER_STATE).
                }
            }

            // 2. Accounts
            const { data: accs } = await supabase.from('accounts').select('*').eq('user_id', userId);
            if (accs && accs.length > 0) {
                setAccounts(accs.map(a => ({
                    id: a.id,
                    name: a.name,
                    type: a.type as AccountType,
                    balance: parseFloat(a.balance),
                    currency: a.currency,
                    color: a.color || 'bg-ink'
                })));
            }

            // 3. Transactions
            const { data: txs } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: false })
                .limit(500);

            if (txs) {
                setTransactions(txs.map(t => ({
                    id: t.id,
                    date: t.date,
                    amount: parseFloat(t.amount),
                    category: t.category as Category,
                    description: t.description,
                    accountId: t.account_id,
                    type: t.type as 'expense' | 'income'
                })));
            }

            // 4. Budgets
            const { data: bgs } = await supabase.from('budgets').select('*').eq('user_id', userId);
            if (bgs && bgs.length > 0) {
                setBudgets(bgs.map(b => ({
                    id: b.id,
                    category: b.category as Category,
                    limit: parseFloat(b.limit_amount)
                })));
            }

            // 5. Goals
            const { data: gls } = await supabase.from('goals').select('*').eq('user_id', userId);
            if (gls && gls.length > 0) {
                setGoals(gls.map(g => ({
                    id: g.id,
                    title: g.title,
                    targetAmount: parseFloat(g.target_amount),
                    savedAmount: parseFloat(g.saved_amount),
                    emoji: g.emoji,
                    deadline: g.deadline
                })));
            }

            // 6. Bill Splitter Groups
            const { groups: loadedGroups, error: groupsError } = await getGroups(supabase, userId);
            if (loadedGroups) {
                setGroups(loadedGroups);
            }
            if (groupsError) handleSupabaseError(groupsError, 'fetchData:loadGroups');

        } catch (error) {
            handleSupabaseError(error, 'fetchData');
        } finally {
            setIsLoading(false);
        }
    };

    // --- REALTIME LISTENERS ---
    useEffect(() => {
        if (!user || !supabase) return;

        const channel = supabase.channel('realtime_sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id = eq.${user.id} ` }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    const newRecord = payload.new;
                    const tx: Transaction = {
                        id: newRecord.id,
                        date: newRecord.date,
                        amount: parseFloat(newRecord.amount),
                        category: newRecord.category as Category,
                        description: newRecord.description,
                        accountId: newRecord.account_id,
                        type: newRecord.type as 'expense' | 'income'
                    };
                    setTransactions(prev => prev.some(t => t.id === tx.id) ? prev : [tx, ...prev]);
                } else if (payload.eventType === 'DELETE') {
                    setTransactions(prev => prev.filter(t => t.id !== payload.old.id));
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'accounts', filter: `user_id = eq.${user.id} ` }, (payload) => {
                if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                    supabase.from('accounts').select('*').eq('user_id', user.id).then(({ data }) => {
                        if (data) setAccounts(data.map(a => ({ id: a.id, name: a.name, type: a.type as AccountType, balance: parseFloat(a.balance), currency: a.currency, color: a.color || 'bg-ink' })));
                    });
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user]);

    // --- AUTH MONITOR & SESSION HANDLING ---
    useEffect(() => {
        if (!supabase) { setIsLoading(false); return; }

        // Check "Stay Signed In" preference from session storage
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            // Check if user explicitly opted out of persistence in previous session
            // If 'banky_no_persist' is set, we might want to sign out, but Supabase handles session persistence by default.
            // The 'rememberMe' logic here is primarily for *future* sessions or explicit sign-outs on window close.

            if (session?.user) {
                // Get profile to load premium status
                const { data: profile } = await supabase.from('profiles').select('is_premium, premium_expires_at, name').eq('id', session.user.id).maybeSingle();

                setUser({
                    id: session.user.id,
                    email: session.user.email || 'User',
                    name: profile?.name || session.user.user_metadata?.name || 'User',
                    isPremium: profile?.is_premium || false,
                    premiumExpiresAt: profile?.premium_expires_at || undefined
                });
                fetchData(session.user.id);
            } else {
                setIsLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                // Get profile to load premium status
                const { data: profile } = await supabase.from('profiles').select('is_premium, premium_expires_at, name').eq('id', session.user.id).maybeSingle();

                setUser({
                    id: session.user.id,
                    email: session.user.email || 'User',
                    name: profile?.name || session.user.user_metadata?.name || 'User',
                    isPremium: profile?.is_premium || false,
                    premiumExpiresAt: profile?.premium_expires_at || undefined
                });
                if (event === 'SIGNED_IN') fetchData(session.user.id);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setIsLoading(false);
                // Clear all local data on logout
                setTransactions([]);
                setAccounts([]);
                setBudgets([]);
                setBudgets([]);
                setGoals([]);
                setGroups([]);
                setUserState(INITIAL_USER_STATE);
            }
        });

        // Handle "Don't Stay Signed In" on window close
        const handleUnload = () => {
            if (sessionStorage.getItem('banky_no_persist') === 'true' && supabase) {
                supabase.auth.signOut();
            }
        };
        window.addEventListener('beforeunload', handleUnload);

        // Auto-refresh profile on visibility change (Critical for iOS PWA)
        // visibilitychange is more reliable than focus on mobile Safari
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && user) {
                fetchData(user.id);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Also listen for custom event from PaymentSuccess
        const handlePaymentSuccess = () => {
            if (user) fetchData(user.id);
        };
        window.addEventListener('payment-success', handlePaymentSuccess);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('beforeunload', handleUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('payment-success', handlePaymentSuccess);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- ACTIONS ---

    const addTransaction = async (t: Omit<Transaction, 'id'>) => {
        let targetAccountId = t.accountId;

        // Auto-create default account if none exists
        if (!targetAccountId && accounts.length === 0) {
            logger.info('No account found. Creating default account...');
            if (supabase && user) {
                // Ensure profile exists (foreign key constraint)
                const { error: profileError } = await supabase.from('profiles').upsert({
                    id: user.id,
                    total_xp: userState.totalXp || 0,
                    level: userState.level || 1,
                    streak_days: userState.streakDays || 1,
                    has_completed_onboarding: userState.hasCompletedOnboarding || false
                });
                if (profileError) { handleSupabaseError(profileError, 'addTransaction:ensureProfile'); return; }

                const { account, error } = await createDefaultAccount(supabase, user.id, DEFAULT_CURRENCY.code);
                if (account) {
                    setAccounts([account]);
                    targetAccountId = account.id;
                } else {
                    handleSupabaseError(error, 'addTransaction:createDefaultAccount');
                    return;
                }
            }
        } else if (!targetAccountId) {
            if (accounts.length > 0) targetAccountId = accounts[0].id;
            else { logger.warn('No account found for transaction'); return; }
        }

        const optimisticId = crypto.randomUUID();
        const newTx: Transaction = { ...t, id: optimisticId, accountId: targetAccountId };
        setTransactions(prev => [newTx, ...prev]);

        setAccounts(prev => prev.map(a => {
            if (a.id === targetAccountId) {
                const newBalance = t.type === 'income' ? a.balance + t.amount : a.balance - t.amount;
                return { ...a, balance: newBalance };
            }
            return a;
        }));

        addXp(10);

        if (supabase && user && targetAccountId) {
            const { error } = await saveTransaction(supabase, user.id, newTx);

            if (error) {
                handleSupabaseError(error, 'addTransaction:saveTransaction');
                return;
            }

            const account = accounts.find(a => a.id === targetAccountId);
            // Note: We use the *updated* balance logic here, but 'account' from state might be stale if we don't calculate it.
            // However, since we just updated state, we can calculate the new balance.
            // Ideally we should use the state setter callback or calculate it deterministically.
            // For now, let's recalculate based on the found account (which is pre-update in this scope? No, 'accounts' is from closure)
            // Actually, 'accounts' is from the render scope, so it is the *old* accounts.
            if (account) {
                const newBalance = t.type === 'income' ? account.balance + t.amount : account.balance - t.amount;
                const { error: balanceError } = await updateAccountBalance(supabase, targetAccountId, newBalance);
                if (balanceError) handleSupabaseError(balanceError, 'addTransaction:updateBalance');
            }
        } else {
            logger.warn('Cannot save transaction: Missing user or account ID');
        }
    };

    const deleteTransaction = async (id: string) => {
        const txToDelete = transactions.find(t => t.id === id);
        if (!txToDelete) return;

        setTransactions(prev => prev.filter(t => t.id !== id));

        setAccounts(prev => prev.map(a => {
            if (a.id === txToDelete.accountId) {
                const correctedBalance = txToDelete.type === 'income'
                    ? a.balance - txToDelete.amount
                    : a.balance + txToDelete.amount;
                return { ...a, balance: correctedBalance };
            }
            return a;
        }));

        if (supabase && user) {
            const { error } = await supabase.from('transactions').delete().eq('id', id);
            if (!error) {
                const account = accounts.find(a => a.id === txToDelete.accountId);
                if (account) {
                    const correctedBalance = txToDelete.type === 'income'
                        ? account.balance - txToDelete.amount
                        : account.balance + txToDelete.amount;
                    await supabase.from('accounts').update({ balance: correctedBalance }).eq('id', txToDelete.accountId);
                }
            }
        }
    };

    const createAccount = async (acc: Omit<Account, 'id'>, preferredCurrency?: Currency) => {
        const optimisticId = crypto.randomUUID();
        const newAcc: Account = { ...acc, id: optimisticId };
        setAccounts(prev => [...prev, newAcc]);

        // Preferred currency now handled by PreferencesContext

        if (supabase && user) {
            // 1. Ensure Profile Exists (Critical for Foreign Key)
            const { error: profileError } = await supabase.from('profiles').upsert({
                id: user.id,
                total_xp: userState.totalXp || 0,
                level: userState.level || 1,
                streak_days: userState.streakDays || 1,
                has_completed_onboarding: userState.hasCompletedOnboarding || false
            });

            if (profileError) {
                handleSupabaseError(profileError, 'createAccount:ensureProfile');
                return { error: profileError };
            }

            // 2. Create Account
            const { error } = await supabase.from('accounts').insert({
                id: optimisticId,
                user_id: user.id,
                name: acc.name,
                type: acc.type,
                balance: acc.balance,
                currency: acc.currency,
                color: acc.color
            });

            if (error) {
                handleSupabaseError(error, 'createAccount');
                // Rollback optimistic update if needed, or just let the user retry
                return { error };
            }
        }
        return { error: null };
    };

    const deleteAccount = async (id: string) => {
        // 1. Remove Account
        setAccounts(prev => prev.filter(a => a.id !== id));

        // 2. Cascade Delete Transactions (Prevent Orphans)
        setTransactions(prev => prev.filter(t => t.accountId !== id));

        if (supabase) {
            // Setup DB deletion (Foreign keys should handle cascade, but explicit is safer if not set)
            await supabase.from('transactions').delete().eq('account_id', id);
            await supabase.from('accounts').delete().eq('id', id);
        }
    };

    const updateBudget = async (category: Category, limit: number) => {
        setBudgets(prev => {
            const exists = prev.find(b => b.category === category);
            if (exists) {
                return prev.map(b => b.category === category ? { ...b, limit } : b);
            }
            return [...prev, { category, limit }];
        });

        if (supabase && user) {
            const { data: existing } = await supabase.from('budgets').select('id').eq('user_id', user.id).eq('category', category).maybeSingle();
            if (existing) {
                await supabase.from('budgets').update({ limit_amount: limit }).eq('id', existing.id);
            } else {
                await supabase.from('budgets').insert({ user_id: user.id, category, limit_amount: limit });
            }
        }
    };

    const addGoal = async (goal: Omit<Goal, 'id'>) => {
        const optimisticId = crypto.randomUUID();
        setGoals(prev => [...prev, { ...goal, id: optimisticId }]);

        if (supabase && user) {
            await supabase.from('goals').insert({
                id: optimisticId,
                user_id: user.id,
                title: goal.title,
                target_amount: goal.targetAmount,
                saved_amount: goal.savedAmount,
                emoji: goal.emoji,
                deadline: goal.deadline
            });
        }
    };

    const updateGoal = async (id: string, savedAmount: number) => {
        setGoals(prev => prev.map(g => g.id === id ? { ...g, savedAmount } : g));
        if (supabase) await supabase.from('goals').update({ saved_amount: savedAmount }).eq('id', id);
    };

    const deleteGoal = async (id: string) => {
        setGoals(prev => prev.filter(g => g.id !== id));
        if (supabase) await supabase.from('goals').delete().eq('id', id);
    };

    const addXp = async (amount: number) => {
        if (!user) return;
        const { newXp, newLevel } = await addXpService(supabase, user.id, userState.totalXp, amount);
        setUserState(prev => ({ ...prev, totalXp: newXp, level: newLevel }));
    };

    const unlockReward = async (item: string) => {
        if (userState.inventory.includes(item)) return;
        const newInventory = [...userState.inventory, item];
        setUserState(prev => ({ ...prev, inventory: newInventory }));
        if (supabase && user) await supabase.from('profiles').upsert({ id: user.id, inventory: newInventory });
    };

    const markUnitComplete = async (unitId: string) => {
        if (userState.completedUnitIds.includes(unitId)) return;
        const newCompleted = [...userState.completedUnitIds, unitId];
        setUserState(prev => ({ ...prev, completedUnitIds: newCompleted }));
        if (supabase && user) {
            const { error } = await supabase.from('profiles').upsert({ id: user.id, completed_unit_ids: newCompleted });
            if (error) handleSupabaseError(error, 'markUnitComplete');
        } else {
            logger.warn('Cannot save progress: User not authenticated');
        }
    };

    const updateUserName = async (name: string) => {
        setUser(prev => prev ? { ...prev, name } : null);
        if (supabase && user) {
            await supabase.from('profiles').upsert({ id: user.id, name });
        }
    };

    const completeOnboarding = async () => {
        setUserState(prev => ({ ...prev, hasCompletedOnboarding: true }));

        if (user) {
            localStorage.setItem(`banky_onboarding_${user.id} `, 'true');
        }

        if (supabase && user) {
            // IMPORTANT: This persists the "Set up complete" state in DB
            const { error } = await supabase.from('profiles').upsert({
                id: user.id,
                has_completed_onboarding: true
            });
            if (error) handleSupabaseError(error, 'completeOnboarding');
        }
    }

    // Handle Login Preference (and dev mode login)
    const login = async (rememberMe: boolean = true, devUser?: { id: string; email: string; name?: string }) => {
        if (!rememberMe) {
            sessionStorage.setItem('banky_no_persist', 'true');
        } else {
            sessionStorage.removeItem('banky_no_persist');
        }

        // DEV MODE: Directly set user state for test account
        if (devUser && import.meta.env?.DEV) {
            console.log('🔧 DEV MODE: Setting user state directly');
            setUser({
                id: devUser.id,
                email: devUser.email,
                name: devUser.name || 'Dev Tester',
                isPremium: true // Give premium features in dev mode
            });
            setUserState(prev => ({ ...prev, hasCompletedOnboarding: true }));
            setIsLoading(false);
        }
    };

    const logout = async () => {
        if (supabase) await supabase.auth.signOut();
        sessionStorage.removeItem('banky_no_persist');
        setUser(null);
    };

    // --- BILL SPLITTER LOGIC ---
    // groups state moved to top

    const addGroup = async (name: string, members: Member[]) => {
        const newGroup: Group = {
            id: crypto.randomUUID(),
            name,
            members,
            expenses: []
        };
        setGroups(prev => [...prev, newGroup]);


        if (supabase && user) {
            const { error } = await createGroup(supabase, user.id, newGroup);
            if (error) {
                handleSupabaseError(error, 'addGroup');
            }
        }
    };

    const addExpense = async (groupId: string, expense: Omit<Expense, 'id'>) => {
        const newExpense: Expense = { ...expense, id: crypto.randomUUID() };

        setGroups(prev => prev.map(g => {
            if (g.id === groupId) {
                const updatedExpenses = [...g.expenses, newExpense];

                // Update member balances in state (optimistic)
                const updatedMembers = g.members.map(m => {
                    let balanceChange = 0;

                    // If member paid, they get positive balance change
                    if (m.id === expense.paidBy) {
                        balanceChange += expense.amount;
                    }

                    // If member is part of split, they get negative balance change (owe money)
                    const split = expense.splitDetails.find(s => s.memberId === m.id);
                    if (split) {
                        balanceChange -= split.amount;
                    }

                    return { ...m, balance: m.balance + balanceChange };
                });

                return { ...g, members: updatedMembers, expenses: updatedExpenses };
            }
            return g;
        }));


        if (supabase && user) {
            const { error } = await addExpenseService(supabase, user.id, groupId, newExpense);
            if (error) {
                handleSupabaseError(error, 'addExpense');
                logger.debug('Expense error details', { error });
            }

            // Update member balances in DB
            // We need to calculate the new balances and update them.
            // Since we did it optimistically, we can just grab the updated group from state? 
            // No, state update is async. We should calculate here.
            const group = groups.find(g => g.id === groupId);
            if (group) {
                // Re-calculate logic for DB update
                // Note: This is slightly inefficient as we iterate again, but safer.
                // Actually, let's just update the members involved.

                // (DB update logic omitted for brevity as it's complex to replicate exactly without re-fetching, 
                // but since we have the service, we rely on that for persistence. 
                // Ideally we'd update individual member balances in DB here too, but for now let's assume the service handles the main insert.
                // Wait, addExpenseService ONLY inserts the expense/splits. It does NOT update member balances in split_members table.
                // We need to do that manually here or in the service.
                // The previous implementation had logic for this. Let's restore/ensure it works.

                const payer = group.members.find(m => m.id === expense.paidBy);
                if (payer) {
                    // We need the *latest* balance. But for now let's trust the optimistic update logic above is correct
                    // and we should push *that* to DB.
                    // Actually, simpler: just fetch the group again? No, slow.
                    // Let's just update the balances in DB based on the delta.

                    // Update Payer (+amount)
                    await updateMemberBalance(supabase, payer.id, payer.balance + expense.amount);
                }

                for (const split of expense.splitDetails) {
                    const member = group.members.find(m => m.id === split.memberId);
                    if (member) {
                        // Update Member (-splitAmount)
                        await updateMemberBalance(supabase, member.id, member.balance - split.amount);
                    }
                }
            }
        }
    };

    const deleteGroupFn = async (groupId: string) => {
        setGroups(prev => prev.filter(g => g.id !== groupId));
        if (supabase) {
            const { error } = await deleteGroup(supabase, groupId);
            if (error) handleSupabaseError(error, 'deleteGroup');
        }
    };

    const deleteExpenseFn = async (groupId: string, expenseId: string) => {
        // 1. Find the expense to reverse balances
        const group = groups.find(g => g.id === groupId);
        const expense = group?.expenses.find(e => e.id === expenseId);

        if (group && expense) {
            // Optimistic Update
            setGroups(prev => prev.map(g => {
                if (g.id === groupId) {
                    const updatedExpenses = g.expenses.filter(e => e.id !== expenseId);

                    // Reverse balances
                    const updatedMembers = g.members.map(m => {
                        let balanceChange = 0;
                        if (m.id === expense.paidBy) balanceChange -= expense.amount; // Reverse payer
                        const split = expense.splitDetails.find(s => s.memberId === m.id);
                        if (split) balanceChange += split.amount; // Reverse split
                        return { ...m, balance: m.balance + balanceChange };
                    });

                    return { ...g, members: updatedMembers, expenses: updatedExpenses };
                }
                return g;
            }));

            // DB Update
            if (supabase) {
                const { error } = await deleteExpense(supabase, expenseId);
                if (error) handleSupabaseError(error, 'deleteExpense');

                // Reverse balances in DB
                // Payer
                const payer = group.members.find(m => m.id === expense.paidBy);
                if (payer) await updateMemberBalance(supabase, payer.id, payer.balance - expense.amount);

                // Splitters
                for (const split of expense.splitDetails) {
                    const member = group.members.find(m => m.id === split.memberId);
                    if (member) await updateMemberBalance(supabase, member.id, member.balance + split.amount);
                }
            }
        }
    };

    const settleDebt = (groupId: string, fromId: string, toId: string, amount: number) => {
        // A settlement is just an expense where 'from' pays 'to'.
        // Or rather, 'from' pays 'amount' to 'to'.
        // In Splitwise, this is recorded as a payment.
        // We can model it as an expense paid by 'from' with 'to' getting the benefit (split).
        // Wait, if A owes B $10. A pays B $10.
        // Expense: Paid by A, $10. Split: B gets 100% of benefit (so B's balance decreases).
        // B was +10 (owed). Now B "consumed" 10, so B is +0.
        // A was -10 (owed). A paid 10. A is +0.

        addExpense(groupId, {
            description: 'Settlement',
            amount,
            paidBy: fromId,
            date: new Date().toISOString(),
            splitDetails: [{ memberId: toId, amount }],
            splitMethod: 'exact'
        });
    };



    return (
        <BankyContext.Provider value={{
            isAuthenticated: !!user, isLoading, user,
            login: login,
            logout, updateUserName, completeOnboarding,
            transactions, addTransaction, deleteTransaction,
            accounts, createAccount, deleteAccount,
            userState, addXp, unlockReward, markUnitComplete,
            budgets, updateBudget,
            goals, addGoal, updateGoal, deleteGoal,
            showDailyBonus, closeDailyBonus, checkDailyBonus,
            // Bill Splitter
            groups, addGroup, addExpense, settleDebt,
            deleteGroup: deleteGroupFn,
            deleteExpense: deleteExpenseFn,
            refreshProfile: async () => { if (user) await fetchData(user.id); }
        }}>
            {children}
        </BankyContext.Provider>
    );
};
