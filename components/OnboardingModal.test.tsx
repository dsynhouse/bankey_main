import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OnboardingModal from './OnboardingModal';
import { useBanky } from '../context/useBanky';

// Mock useBanky
vi.mock('../context/useBanky', () => ({
    useBanky: vi.fn(),
}));

// Mock Mascot to avoid canvas issues
vi.mock('./Mascot', () => ({
    default: () => <div data-testid="mascot">Mascot</div>,
}));

describe('OnboardingModal', () => {
    const mockCompleteOnboarding = vi.fn();
    const mockCreateAccount = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('does not render if isLoading is true', () => {
        (useBanky as any).mockReturnValue({
            userState: { hasCompletedOnboarding: false },
            createAccount: mockCreateAccount,
            completeOnboarding: mockCompleteOnboarding,
            currency: { code: 'USD', symbol: '$' },
            isLoading: true,
        });

        const { container } = render(<OnboardingModal />);
        expect(container).toBeEmptyDOMElement();
    });

    it('does not render if hasCompletedOnboarding is true', () => {
        (useBanky as any).mockReturnValue({
            userState: { hasCompletedOnboarding: true },
            createAccount: mockCreateAccount,
            completeOnboarding: mockCompleteOnboarding,
            currency: { code: 'USD', symbol: '$' },
            isLoading: false,
        });

        const { container } = render(<OnboardingModal />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders if hasCompletedOnboarding is false and not loading', () => {
        (useBanky as any).mockReturnValue({
            userState: { hasCompletedOnboarding: false },
            createAccount: mockCreateAccount,
            completeOnboarding: mockCompleteOnboarding,
            currency: { code: 'USD', symbol: '$' },
            isLoading: false,
        });

        render(<OnboardingModal />);
        expect(screen.getByText('Welcome to the Clan!')).toBeInTheDocument();
    });

    it('calls completeOnboarding when "Enter Dashboard" is clicked', async () => {
        (useBanky as any).mockReturnValue({
            userState: { hasCompletedOnboarding: false },
            createAccount: mockCreateAccount,
            completeOnboarding: mockCompleteOnboarding,
            currency: { code: 'USD', symbol: '$' },
            isLoading: false,
        });

        render(<OnboardingModal />);

        // Step 1: Welcome -> Click "Let's Set Up"
        fireEvent.click(screen.getByText("Let's Set Up"));

        // Step 2: Currency -> Click "Continue" (assuming default currency is selected)
        await waitFor(() => screen.getByText('Pick Your Currency'));
        fireEvent.click(screen.getByText('Continue'));

        // Step 3: Wallet -> Fill form and Click "Create & Continue"
        await waitFor(() => screen.getByText('Setup Wallet'));

        const balanceInput = screen.getByPlaceholderText('0.00');
        fireEvent.change(balanceInput, { target: { value: '1000' } });

        fireEvent.click(screen.getByText('Create & Continue'));

        // Step 4: Ready -> Click "Enter Dashboard"
        await waitFor(() => screen.getByText('You are Set!'));
        fireEvent.click(screen.getByText('Enter Dashboard'));

        expect(mockCompleteOnboarding).toHaveBeenCalled();
    });
});
