
import React, { useState, useEffect } from 'react';
import { Transaction, Account, AccountType, UserState, Budget, Category, UserProfile, Currency, Goal, Theme, RegionCode } from '../types';
import { INITIAL_USER_STATE, SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from '../constants';
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

    const [userState, setUserState] = useState<UserState>(INITIAL_USER_STATE);
    const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);
    const [region, setRegionState] = useState<RegionCode>('Global');

    // --- UI STATE ---
    const [theme, setTheme] = useState<Theme>('light');
    const [showDailyBonus, setShowDailyBonus] = useState(false);

    // --- THEME & REGION PERSISTENCE ---
    useEffect(() => {
        if (user) {
            const savedTheme = localStorage.getItem(`banky_theme_${user.id}`) as Theme;
            if (savedTheme) setTheme(savedTheme);

            const savedRegion = localStorage.getItem(`banky_region_${user.id}`) as RegionCode;
            if (savedRegion) setRegionState(savedRegion);
        } else {
            const savedTheme = localStorage.getItem('banky_theme_pref') as Theme;
            if (savedTheme) setTheme(savedTheme);
        }
    }, [user]);

    useEffect(() => {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        if (user) {
            localStorage.setItem(`banky_theme_${user.id}`, theme);
        }
        localStorage.setItem('banky_theme_pref', theme);
    }, [theme, user]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const closeDailyBonus = () => {
        setShowDailyBonus(false);
    };

    const hydrateCurrency = (code: string) => {
        const found = SUPPORTED_CURRENCIES.find(c => c.code === code);
        if (found) setCurrencyState(found);
    };

    const setRegion = (r: RegionCode) => {
        setRegionState(r);
        if (user) {
            localStorage.setItem(`banky_region_${user.id}`, r);
        }
    };

    // --- DAILY BONUS LOGIC (Robust ISO Date Check) ---
    const checkDailyBonus = async (userId: string, lastBonusDate: string | null, currentStreak: number) => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format (UTC)
        // NOTE: Using UTC ensures consistency across devices, though it might reset at a different time than local midnight.

        // 1. Check LocalStorage first (Double-Lock)
        const localLastBonus = localStorage.getItem(`banky_last_bonus_${userId}`);
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
        localStorage.setItem(`banky_last_bonus_${userId}`, todayStr);

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
            if (error) console.error("Error updating Daily Bonus:", error);
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
            const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', userId).single();

            if (profile) {
                setUserState({
                    totalXp: profile.total_xp || 0,
                    level: profile.level || 1,
                    streakDays: profile.streak_days || 1,
                    completedUnitIds: profile.completed_unit_ids || [],
                    inventory: profile.inventory || [],
                    hasCompletedOnboarding: profile.has_completed_onboarding || false
                });

                // LocalStorage Override for Onboarding
                const localOnboarding = localStorage.getItem(`banky_onboarding_${userId}`);
                if (localOnboarding === 'true' && !profile.has_completed_onboarding) {
                    setUserState(prev => ({ ...prev, hasCompletedOnboarding: true }));
                    // Try to sync back to DB if it was missed
                    if (supabase) supabase.from('profiles').upsert({ id: userId, has_completed_onboarding: true });
                }
                if (profile.currency_code) {
                    hydrateCurrency(profile.currency_code);
                }

                // Sync user name from profile if available
                if (profile.name) {
                    setUser(prev => prev ? { ...prev, name: profile.name } : prev);
                }

                // Check Daily Bonus using DB date and streak
                checkDailyBonus(userId, profile.last_bonus_date, profile.streak_days || 1);
            } else {
                // Profile missing? Create one.
                console.log("Profile not found. Creating default profile...");
                const { error: insertError } = await supabase.from('profiles').upsert({
                    id: userId,
                    total_xp: 0,
                    level: 1,
                    streak_days: 1,
                    has_completed_onboarding: false
                });

                if (insertError) {
                    console.error("Error creating profile:", insertError);
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

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- REALTIME LISTENERS ---
    useEffect(() => {
        if (!user || !supabase) return;

        const channel = supabase.channel('realtime_sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, (payload) => {
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
            .on('postgres_changes', { event: '*', schema: 'public', table: 'accounts', filter: `user_id=eq.${user.id}` }, (payload) => {
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
        supabase.auth.getSession().then(({ data: { session } }) => {
            // Check if user explicitly opted out of persistence in previous session
            // If 'banky_no_persist' is set, we might want to sign out, but Supabase handles session persistence by default.
            // The 'rememberMe' logic here is primarily for *future* sessions or explicit sign-outs on window close.

            if (session?.user) {
                setUser({ id: session.user.id, email: session.user.email || 'User', name: session.user.user_metadata?.name || 'User' });
                fetchData(session.user.id);
            } else {
                setIsLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                setUser({ id: session.user.id, email: session.user.email || 'User', name: session.user.user_metadata?.name || 'User' });
                if (event === 'SIGNED_IN') fetchData(session.user.id);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setIsLoading(false);
                // Clear all local data on logout
                setTransactions([]);
                setAccounts([]);
                setBudgets([]);
                setGoals([]);
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

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('beforeunload', handleUnload);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- ACTIONS ---

    const addTransaction = async (t: Omit<Transaction, 'id'>) => {
        let targetAccountId = t.accountId;

        // Auto-create default account if none exists
        if (!targetAccountId && accounts.length === 0) {
            console.log("No account found. Creating default account...");
            const defaultAccountId = crypto.randomUUID();
            const defaultAccount: Account = {
                id: defaultAccountId,
                name: 'Main Wallet',
                type: AccountType.SPENDING,
                balance: 0,
                currency: currency.code,
                color: 'bg-banky-pink'
            };

            setAccounts([defaultAccount]);
            targetAccountId = defaultAccountId;

            // Save to database
            if (supabase && user) {
                // CRITICAL: Ensure profile exists first (foreign key constraint)
                const { error: profileError } = await supabase.from('profiles').upsert({
                    id: user.id,
                    total_xp: userState.totalXp || 0,
                    level: userState.level || 1,
                    streak_days: userState.streakDays || 1,
                    has_completed_onboarding: userState.hasCompletedOnboarding || false
                });

                if (profileError) {
                    console.error("Error ensuring profile exists:", profileError);
                    return;
                }

                // Now create the account
                const { error } = await supabase.from('accounts').insert({
                    id: defaultAccountId,
                    user_id: user.id,
                    name: 'Main Wallet',
                    type: AccountType.SPENDING,
                    balance: 0,
                    currency: currency.code,
                    color: 'bg-banky-pink'
                });
                if (error) {
                    console.error("Error creating default account:", error);
                    return;
                }
            }
        } else if (!targetAccountId) {
            if (accounts.length > 0) targetAccountId = accounts[0].id;
            else {
                console.warn("No account found for transaction");
                return;
            }
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
            const { error } = await supabase.from('transactions').insert({
                id: optimisticId,
                user_id: user.id,
                account_id: targetAccountId,
                amount: t.amount,
                category: t.category,
                description: t.description,
                type: t.type,
                date: t.date
            });

            if (error) {
                console.error("Error adding transaction:", error);
                // Optionally: revert optimistic update here
                return;
            }

            const account = accounts.find(a => a.id === targetAccountId);
            if (account) {
                const newBalance = t.type === 'income' ? account.balance + t.amount : account.balance - t.amount;
                const { error: balanceError } = await supabase.from('accounts').update({ balance: newBalance }).eq('id', targetAccountId);
                if (balanceError) console.error("Error updating account balance:", balanceError);
            }
        } else {
            console.warn("Cannot save transaction: Missing user or account ID");
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

        // Update Global Currency if provided (during onboarding)
        if (preferredCurrency) {
            setCurrency(preferredCurrency);
        }

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
                console.error("Error ensuring profile exists during account creation:", profileError);
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
                console.error("Error creating account:", error);
                // Rollback optimistic update if needed, or just let the user retry
                return { error };
            }
        }
        return { error: null };
    };

    const deleteAccount = async (id: string) => {
        setAccounts(prev => prev.filter(a => a.id !== id));
        if (supabase) await supabase.from('accounts').delete().eq('id', id);
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
        const newXp = (userState?.totalXp || 0) + amount;
        const newLevel = Math.floor(newXp / 500) + 1;

        setUserState(prev => ({ ...prev, totalXp: newXp, level: newLevel }));

        if (supabase && user) {
            await supabase.from('profiles').update({ total_xp: newXp, level: newLevel }).eq('id', user.id);
        }
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
            if (error) console.error("Error marking unit complete:", error);
        } else {
            console.warn("Cannot save progress: User not authenticated");
        }
    };

    const setCurrency = async (c: Currency) => {
        setCurrencyState(c);
        if (supabase && user) {
            const { error } = await supabase.from('profiles').upsert({ id: user.id, currency_code: c.code });
            if (error) console.error("Error saving currency:", error);
        }
    };

    const updateUserName = async (name: string) => {
        setUser(prev => prev ? { ...prev, name } : null);
        if (supabase && user) {
            if (supabase && user) {
                await supabase.from('profiles').upsert({ id: user.id, name });
            }
        }
    };

    const completeOnboarding = async () => {
        setUserState(prev => ({ ...prev, hasCompletedOnboarding: true }));

        if (user) {
            localStorage.setItem(`banky_onboarding_${user.id}`, 'true');
        }

        if (supabase && user) {
            // IMPORTANT: This persists the "Set up complete" state in DB
            const { error } = await supabase.from('profiles').upsert({
                id: user.id,
                has_completed_onboarding: true
            });
            if (error) console.error("Error persisting onboarding:", error);
        }
    }

    // Handle Login Preference
    const login = async (rememberMe: boolean = true) => {
        if (!rememberMe) {
            sessionStorage.setItem('banky_no_persist', 'true');
        } else {
            sessionStorage.removeItem('banky_no_persist');
        }
    };

    const logout = async () => {
        if (supabase) await supabase.auth.signOut();
        sessionStorage.removeItem('banky_no_persist');
        setUser(null);
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
            currency, setCurrency,
            theme, toggleTheme,
            region, setRegion,
            showDailyBonus, closeDailyBonus
        }}>
            {children}
        </BankyContext.Provider>
    );
};
