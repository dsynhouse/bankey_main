import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { BankyProvider } from './BankyContext';
import { useBanky } from './useBanky';
import { supabase } from '../services/supabase';
import confetti from 'canvas-confetti';

// Mock Supabase
vi.mock('../services/supabase', () => ({
    supabase: {
        auth: {
            getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
            onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
            signOut: vi.fn(),
        },
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(),
                    maybeSingle: vi.fn(),
                    order: vi.fn(() => ({
                        limit: vi.fn().mockResolvedValue({ data: [] })
                    })),
                })),
            })),
            update: vi.fn(() => ({ eq: vi.fn() })),
            upsert: vi.fn(() => Promise.resolve({ error: null })),
            insert: vi.fn(),
            delete: vi.fn(() => ({ eq: vi.fn() })),
        })),
        channel: vi.fn(() => ({
            on: vi.fn().mockReturnThis(),
            subscribe: vi.fn(),
            removeChannel: vi.fn(),
        })),
        removeChannel: vi.fn(),
    },
}));

// Mock Confetti
vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
}));

describe('BankyContext Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        sessionStorage.clear();
        localStorage.clear();
    });

    it('login with rememberMe=false sets sessionStorage flag', async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => <BankyProvider>{children}</BankyProvider>;
        const { result } = renderHook(() => useBanky(), { wrapper });

        await act(async () => {
            await result.current.login(false);
        });

        expect(sessionStorage.getItem('banky_no_persist')).toBe('true');
    });

    it('login with rememberMe=true removes sessionStorage flag', async () => {
        sessionStorage.setItem('banky_no_persist', 'true');
        const wrapper = ({ children }: { children: React.ReactNode }) => <BankyProvider>{children}</BankyProvider>;
        const { result } = renderHook(() => useBanky(), { wrapper });

        await act(async () => {
            await result.current.login(true);
        });

        expect(sessionStorage.getItem('banky_no_persist')).toBeNull();
    });

    it('completeOnboarding updates state and DB', async () => {
        // Mock user being logged in
        const mockUser = { id: 'user123', email: 'test@test.com' };
        (supabase.auth.getSession as any).mockResolvedValue({ data: { session: { user: mockUser } } });

        // Mock profile fetch with intelligent routing based on table name would be better, 
        // but for now we just ensure the chain supports what fetchData needs or we mock fetchData to not crash.
        // Simpler: Just add the missing methods to the chain.
        (supabase.from as any).mockImplementation((table: string) => {
            if (table === 'profiles') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { has_completed_onboarding: false } })
                        })
                    }),
                    update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({}) }),
                    upsert: vi.fn().mockResolvedValue({ error: null })
                };
            }
            // Default mock for other tables (transactions, etc) to prevent crash
            return {
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockReturnValue({
                            limit: vi.fn().mockResolvedValue({ data: [] })
                        }),
                        single: vi.fn().mockResolvedValue({ data: null }),
                        maybeSingle: vi.fn().mockResolvedValue({ data: null })
                    })
                }),
                insert: vi.fn(),
                update: vi.fn().mockReturnValue({ eq: vi.fn() }),
                upsert: vi.fn().mockResolvedValue({ error: null }),
                delete: vi.fn().mockReturnValue({ eq: vi.fn() })
            };
        });

        const wrapper = ({ children }: { children: React.ReactNode }) => <BankyProvider>{children}</BankyProvider>;
        const { result } = renderHook(() => useBanky(), { wrapper });

        // Wait for initial load
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            await result.current.completeOnboarding();
        });

        expect(result.current.userState.hasCompletedOnboarding).toBe(true);
        expect(supabase.from).toHaveBeenCalledWith('profiles');
    });

    it('Daily Bonus is awarded if not claimed today', async () => {
        const mockUser = { id: 'user123', email: 'test@test.com' };
        (supabase.auth.getSession as any).mockResolvedValue({ data: { session: { user: mockUser } } });

        // Mock profile with old bonus date
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        (supabase.from as any).mockImplementation((table: string) => {
            if (table === 'profiles') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: {
                                    id: 'user123',
                                    last_bonus_date: yesterdayStr,
                                    streak_days: 1,
                                    total_xp: 100
                                }
                            })
                        })
                    }),
                    update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({}) }),
                    upsert: vi.fn().mockResolvedValue({ error: null })
                };
            }
            return {
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockReturnValue({
                            limit: vi.fn().mockResolvedValue({ data: [] })
                        }),
                        single: vi.fn().mockResolvedValue({ data: null }),
                        maybeSingle: vi.fn().mockResolvedValue({ data: null })
                    })
                }),
                insert: vi.fn(),
                update: vi.fn().mockReturnValue({ eq: vi.fn() }),
                upsert: vi.fn().mockResolvedValue({ error: null }),
                delete: vi.fn().mockReturnValue({ eq: vi.fn() })
            };
        });

        const wrapper = ({ children }: { children: React.ReactNode }) => <BankyProvider>{children}</BankyProvider>;
        const { result } = renderHook(() => useBanky(), { wrapper });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        // Check if bonus modal is shown
        expect(result.current.showDailyBonus).toBe(true);

        // Check if confetti was fired
        expect(confetti).toHaveBeenCalled();
    });
});
