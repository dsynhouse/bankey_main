import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import * as authService from '../services/authService';

// Mock dependencies
vi.mock('../context/useBanky', () => ({
    useBanky: vi.fn(() => ({
        login: vi.fn(),
    })),
}));

vi.mock('../services/authService', () => ({
    requestOtp: vi.fn(),
    verifyOtp: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Login Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders email input initially', () => {
        render(
            <HelmetProvider>
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            </HelmetProvider>
        );
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('name@domain.com')).toBeInTheDocument();
    });

    it('handles email submission and transitions to OTP step', async () => {
        (authService.requestOtp as unknown as Mock).mockResolvedValue({ success: true });

        render(
            <HelmetProvider>
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            </HelmetProvider>
        );

        const emailInput = screen.getByPlaceholderText('name@domain.com');
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

        const submitButton = screen.getByText('Get Code');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(authService.requestOtp).toHaveBeenCalledWith('test@example.com');
        });

        await waitFor(() => {
            expect(screen.getByText('Security Check')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('12345678')).toBeInTheDocument();
        });
    });

    it('handles OTP verification and login', async () => {
        // Setup initial state as if email was sent
        (authService.requestOtp as unknown as Mock).mockResolvedValue({ success: true });
        (authService.verifyOtp as unknown as Mock).mockResolvedValue({ success: true, user: { id: '123' } });

        render(
            <HelmetProvider>
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            </HelmetProvider>
        );

        // Step 1: Email
        fireEvent.change(screen.getByPlaceholderText('name@domain.com'), { target: { value: 'test@example.com' } });
        fireEvent.click(screen.getByText('Get Code'));

        await waitFor(() => screen.getByPlaceholderText('12345678'));

        // Step 2: OTP
        const otpInput = screen.getByPlaceholderText('12345678');
        fireEvent.change(otpInput, { target: { value: '123456' } });

        const verifyButton = screen.getByText('Verify & Login');
        fireEvent.click(verifyButton);

        await waitFor(() => {
            expect(authService.verifyOtp).toHaveBeenCalledWith('test@example.com', '123456');
        });

        // Check if login was called (we need to spy on the hook implementation if we want to check this strictly, 
        // but since we mocked the module, we can check if the mock function was called if we had access to it. 
        // For now, checking navigation is a good proxy).

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('displays error on failed OTP request', async () => {
        (authService.requestOtp as unknown as Mock).mockResolvedValue({ success: false, message: 'Invalid email' });

        render(
            <HelmetProvider>
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            </HelmetProvider>
        );

        fireEvent.change(screen.getByPlaceholderText('name@domain.com'), { target: { value: 'bad@email' } });
        fireEvent.click(screen.getByText('Get Code'));

        await waitFor(() => {
            expect(screen.getByText('Invalid email')).toBeInTheDocument();
        });
    });
});
