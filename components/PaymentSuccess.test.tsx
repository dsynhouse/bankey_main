import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { UserState } from '../types';
import PaymentSuccess from './PaymentSuccess';
import { BankyContext } from '../context/useBanky';
import { supabase } from '../services/supabase';
import * as razorpayService from '../services/razorpayService';

// Mock dependencies
vi.mock('../services/supabase', () => ({
    supabase: {
        from: vi.fn(),
    },
}));

vi.mock('../services/razorpayService', () => ({
    getUserSubscription: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}));

vi.mock('react-confetti', () => ({
    default: () => <div data-testid="confetti" />
}));

const mockRefreshProfile = vi.fn();
const mockUser = { id: 'test-user-id', email: 'test@example.com' };

const renderWithContext = (component: React.ReactNode) => {
    return render(
        <BankyContext.Provider value={{
            user: mockUser,
            refreshProfile: mockRefreshProfile,
            // Mock other context values as needed to prevent crashes
            isLoading: false,
            transactions: [],
            accounts: [],
            budgets: [],
            goals: [],
            groups: [],
            userState: {} as UserState,
            currency: { code: 'USD', symbol: '$', rate: 1 },
            theme: 'light',
            region: 'Global',
            toggleTheme: vi.fn(),
            addTransaction: vi.fn(),
            deleteTransaction: vi.fn(),
            createAccount: vi.fn(),
            deleteAccount: vi.fn(),
            updateBudget: vi.fn(),
            addGoal: vi.fn(),
            updateGoal: vi.fn(),
            deleteGoal: vi.fn(),
            addXp: vi.fn(),
            unlockReward: vi.fn(),
            markUnitComplete: vi.fn(),
            setCurrency: vi.fn(),
            updateUserName: vi.fn(),
            completeOnboarding: vi.fn(),
            login: vi.fn(),
            logout: vi.fn(),
            addGroup: vi.fn(),
            addExpense: vi.fn(),
            deleteGroup: vi.fn(),
            deleteExpense: vi.fn(),
            showDailyBonus: false,
            closeDailyBonus: vi.fn(),
            checkDailyBonus: vi.fn(),
        }}>
            {component}
        </BankyContext.Provider>
    );
};

describe('PaymentSuccess Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('polls Profile table and triggers refreshProfile on success', async () => {
        // Mock Profile Query (Return is_premium: true)
        const mockSelect = vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: { is_premium: true } }),
                })
            })
        });
        (supabase.from as unknown as Mock).mockImplementation(mockSelect);

        // Mock Subscription Query (Backup)
        (razorpayService.getUserSubscription as unknown as Mock).mockResolvedValue({ status: 'active' });

        renderWithContext(<PaymentSuccess />);

        // Should initially show verifying state
        expect(screen.getByText('Verifying...')).toBeInTheDocument();

        // Wait for async operations
        await waitFor(() => {
            // Should show success
            expect(screen.getByText("You're In!")).toBeInTheDocument();
        });

        // CRITICAL CHECK: Did we force sync?
        expect(mockRefreshProfile).toHaveBeenCalled();
    });

    it('retries if profile says not premium yet', async () => {
        // 1. First call: Not premium
        // 2. Second call: Premium

        const mockSelect = vi.fn()
            .mockReturnValueOnce({ // Select
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: { is_premium: false } })
                    })
                })
            })
            .mockReturnValue({ // Select (Second time happens after retry (2s))
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: { is_premium: true } })
                    })
                })
            });

        (supabase.from as unknown as Mock).mockImplementation((table: string) => {
            if (table === 'profiles') return mockSelect();
            return { select: () => ({ eq: () => ({ single: () => ({ data: null }) }) }) }
        });

        (razorpayService.getUserSubscription as unknown as Mock).mockResolvedValue({ status: 'created' }); // Not active yet

        renderWithContext(<PaymentSuccess />);

        // Wait for retry logic to kick in (real time)
        // verifySubscription retries every ~2s
        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalledTimes(2); // Initial + Retry
            expect(screen.getByText("You're In!")).toBeInTheDocument();
        }, { timeout: 4000 });
    });
});
