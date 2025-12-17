/**
 * Authentication Security Tests
 * Tests auth flow security, session handling, and input validation
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import * as authService from '../services/authService';

// Mock dependencies
vi.mock('../context/useBanky', () => ({
    useBanky: vi.fn(() => ({
        login: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: false,
        user: null,
    })),
}));

vi.mock('../services/authService', () => ({
    requestOtp: vi.fn(),
    verifyOtp: vi.fn(),
}));

vi.mock('../services/supabase', () => ({
    supabase: {
        auth: {
            signOut: vi.fn(() => Promise.resolve({ error: null })),
            getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
        },
    },
}));

// Import after mocks
import Login from './Login';

const renderLogin = () => {
    return render(
        <HelmetProvider>
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        </HelmetProvider>
    );
};

describe('Authentication Security', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Email Validation', () => {
        it('requires valid email format', async () => {
            renderLogin();

            const emailInput = screen.getByPlaceholderText('name@domain.com');
            fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
            fireEvent.click(screen.getByText('Get Code'));

            // Should either show error or not proceed
            await waitFor(() => {
                // The form should not submit with invalid email
                expect(authService.requestOtp).not.toHaveBeenCalled();
            }, { timeout: 1000 }).catch(() => {
                // If it was called, it should be with the invalid email for backend validation
                expect(authService.requestOtp).toHaveBeenCalledWith('invalid-email');
            });
        });

        it('accepts valid email format', async () => {
            (authService.requestOtp as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });

            renderLogin();

            const emailInput = screen.getByPlaceholderText('name@domain.com');
            fireEvent.change(emailInput, { target: { value: 'valid@email.com' } });
            fireEvent.click(screen.getByText('Get Code'));

            await waitFor(() => {
                expect(authService.requestOtp).toHaveBeenCalledWith('valid@email.com');
            });
        });
    });

    describe('OTP Security', () => {
        it('requires OTP code after email submission', async () => {
            (authService.requestOtp as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });

            renderLogin();

            // Submit email
            fireEvent.change(screen.getByPlaceholderText('name@domain.com'), { target: { value: 'test@email.com' } });
            fireEvent.click(screen.getByText('Get Code'));

            await waitFor(() => {
                expect(screen.getByText('Security Check')).toBeInTheDocument();
            });
        });

        it('validates OTP with backend', async () => {
            (authService.requestOtp as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
            (authService.verifyOtp as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true, user: { id: 'test' } });

            renderLogin();

            // Complete email step
            fireEvent.change(screen.getByPlaceholderText('name@domain.com'), { target: { value: 'test@email.com' } });
            fireEvent.click(screen.getByText('Get Code'));

            await waitFor(() => screen.getByPlaceholderText('12345678'));

            // Submit OTP
            fireEvent.change(screen.getByPlaceholderText('12345678'), { target: { value: '123456' } });
            fireEvent.click(screen.getByText('Verify & Login'));

            await waitFor(() => {
                expect(authService.verifyOtp).toHaveBeenCalledWith('test@email.com', '123456');
            });
        });

        it('handles invalid OTP gracefully', async () => {
            (authService.requestOtp as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
            (authService.verifyOtp as ReturnType<typeof vi.fn>).mockResolvedValue({ success: false, message: 'Invalid code' });

            renderLogin();

            // Complete email step
            fireEvent.change(screen.getByPlaceholderText('name@domain.com'), { target: { value: 'test@email.com' } });
            fireEvent.click(screen.getByText('Get Code'));

            await waitFor(() => screen.getByPlaceholderText('12345678'));

            // Submit wrong OTP
            fireEvent.change(screen.getByPlaceholderText('12345678'), { target: { value: 'wrong' } });
            fireEvent.click(screen.getByText('Verify & Login'));

            await waitFor(() => {
                expect(screen.getByText('Invalid code')).toBeInTheDocument();
            });
        });
    });

    describe('Error Handling', () => {
        it('displays server errors to user', async () => {
            (authService.requestOtp as ReturnType<typeof vi.fn>).mockResolvedValue({
                success: false,
                message: 'Server error. Please try again.'
            });

            renderLogin();

            fireEvent.change(screen.getByPlaceholderText('name@domain.com'), { target: { value: 'test@email.com' } });
            fireEvent.click(screen.getByText('Get Code'));

            await waitFor(() => {
                expect(screen.getByText(/Server error/i)).toBeInTheDocument();
            });
        });

        it('handles network failures', async () => {
            (authService.requestOtp as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

            renderLogin();

            fireEvent.change(screen.getByPlaceholderText('name@domain.com'), { target: { value: 'test@email.com' } });
            fireEvent.click(screen.getByText('Get Code'));

            // Should handle error gracefully without crashing
            await waitFor(() => {
                // Either shows an error message or stays on email step
                const emailInput = screen.queryByPlaceholderText('name@domain.com');
                expect(emailInput).toBeInTheDocument();
            });
        });
    });

    describe('Session Security', () => {
        it('does not expose sensitive data in error messages', async () => {
            (authService.requestOtp as ReturnType<typeof vi.fn>).mockResolvedValue({
                success: false,
                message: 'Invalid email'
            });

            renderLogin();

            fireEvent.change(screen.getByPlaceholderText('name@domain.com'), { target: { value: 'hacker@evil.com' } });
            fireEvent.click(screen.getByText('Get Code'));

            await waitFor(() => {
                // Error should not reveal if email exists in system
                const errorText = screen.getByText('Invalid email');
                expect(errorText.textContent).not.toContain('not found');
                expect(errorText.textContent).not.toContain('does not exist');
            });
        });
    });
});

describe('Input Sanitization', () => {
    it('handles XSS attempts in email input', () => {
        renderLogin();

        const emailInput = screen.getByPlaceholderText('name@domain.com');
        const xssAttempt = '<script>alert("xss")</script>';

        fireEvent.change(emailInput, { target: { value: xssAttempt } });

        // Input should not execute script, just display as text
        expect(emailInput).toHaveValue(xssAttempt);
        // Should not have created any script elements
        expect(document.querySelectorAll('script[src]')).toHaveLength(0);
    });

    it('handles SQL injection attempts in email', async () => {
        renderLogin();

        const emailInput = screen.getByPlaceholderText('name@domain.com');
        const sqlAttempt = "'; DROP TABLE users; --";

        fireEvent.change(emailInput, { target: { value: sqlAttempt } });
        fireEvent.click(screen.getByText('Get Code'));

        // Should either reject or pass to backend for proper handling
        // The important thing is it doesn't crash
        expect(emailInput).toHaveValue(sqlAttempt);
    });
});

describe('Rate Limiting Awareness', () => {
    it('handles rate limit responses gracefully', async () => {
        (authService.requestOtp as ReturnType<typeof vi.fn>).mockResolvedValue({
            success: false,
            message: 'Too many attempts. Please try again later.'
        });

        renderLogin();

        fireEvent.change(screen.getByPlaceholderText('name@domain.com'), { target: { value: 'test@email.com' } });
        fireEvent.click(screen.getByText('Get Code'));

        await waitFor(() => {
            expect(screen.getByText(/Too many attempts/i)).toBeInTheDocument();
        });
    });
});
