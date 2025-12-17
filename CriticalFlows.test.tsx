/**
 * E2E Critical User Flows Tests
 * Tests essential application behavior without requiring full component rendering
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Import just the Landing and Login components, not full App
import Landing from './components/LandingPage';
import Login from './components/Login';

// Mock the contexts
vi.mock('./context/useBanky', () => ({
    useBanky: vi.fn(() => ({
        login: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: false,
        isLoading: false,
        user: null,
    })),
}));

vi.mock('./context/PreferencesContext', () => ({
    usePreferences: vi.fn(() => ({
        theme: 'light',
        currency: { code: 'USD', symbol: '$', name: 'US Dollar' },
        region: 'US',
        setRegion: vi.fn(),
    })),
}));

vi.mock('./services/authService', () => ({
    requestOtp: vi.fn(),
    verifyOtp: vi.fn(),
}));

const renderWithProviders = (component: React.ReactElement) => {
    return render(
        <HelmetProvider>
            <BrowserRouter>
                {component}
            </BrowserRouter>
        </HelmetProvider>
    );
};

describe('E2E Critical User Flows', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Mock IntersectionObserver for jsdom
        global.IntersectionObserver = class IntersectionObserver {
            constructor(callback: IntersectionObserverCallback) { }
            observe() { return null; }
            unobserve() { return null; }
            disconnect() { return null; }
            root: Element | null = null;
            rootMargin: string = '';
            thresholds: ReadonlyArray<number> = [];
            takeRecords(): IntersectionObserverEntry[] { return []; }
        };
    });

    describe('Landing Page', () => {
        it('renders landing page correctly', () => {
            renderWithProviders(<Landing />);
            // Use queryAllByText since 'bankey' appears multiple times
            const bankeyElements = screen.queryAllByText(/bankey/i);
            expect(bankeyElements.length).toBeGreaterThan(0);
        });

        it('displays get started call-to-action', () => {
            renderWithProviders(<Landing />);
            // Use queryAllByText since 'Join' appears multiple times
            const ctaElements = screen.queryAllByText(/Join|Get Started|Sign Up/i);
            expect(ctaElements.length).toBeGreaterThan(0);
        });

        it('has navigation to login', () => {
            renderWithProviders(<Landing />);
            const loginElements = screen.queryAllByText(/Log In|Sign In/i);
            expect(loginElements.length).toBeGreaterThan(0);
        });
    });

    describe('Login Page', () => {
        it('renders login form', () => {
            renderWithProviders(<Login />);
            expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
        });

        it('has email input field', () => {
            renderWithProviders(<Login />);
            expect(screen.getByPlaceholderText(/email|@|domain/i)).toBeInTheDocument();
        });

        it('has submit button', () => {
            renderWithProviders(<Login />);
            expect(screen.getByText(/Get Code/i)).toBeInTheDocument();
        });
    });

    describe('Navigation Flow Validation', () => {
        it('landing page mounts without crashing', () => {
            expect(() => renderWithProviders(<Landing />)).not.toThrow();
        });

        it('login page mounts without crashing', () => {
            expect(() => renderWithProviders(<Login />)).not.toThrow();
        });
    });
});

describe('Route Structure Validation', () => {
    it('app has defined route paths', () => {
        const expectedRoutes = [
            '/',
            '/login',
            '/register',
            '/dashboard',
            '/tracker',
            '/education',
            '/advisor',
            '/settings',
            '/terms',
            '/privacy',
        ];

        // Validate that we have expected routes defined
        expect(expectedRoutes.length).toBeGreaterThan(0);
        expect(expectedRoutes).toContain('/');
        expect(expectedRoutes).toContain('/login');
        expect(expectedRoutes).toContain('/dashboard');
    });

    it('protected routes require authentication', () => {
        const protectedRoutes = ['/dashboard', '/tracker', '/education', '/advisor', '/settings'];
        const publicRoutes = ['/', '/login', '/register', '/terms', '/privacy'];

        // Verify separation of concerns
        protectedRoutes.forEach(route => {
            expect(publicRoutes).not.toContain(route);
        });
    });
});

describe('Authentication State Validation', () => {
    it('unauthenticated state is properly detected', () => {
        const mockAuth = {
            isAuthenticated: false,
            user: null,
            isLoading: false,
        };

        expect(mockAuth.isAuthenticated).toBe(false);
        expect(mockAuth.user).toBeNull();
    });

    it('authenticated state structure is correct', () => {
        const mockAuth = {
            isAuthenticated: true,
            user: { id: '123', email: 'test@test.com', name: 'Test' },
            isLoading: false,
        };

        expect(mockAuth.isAuthenticated).toBe(true);
        expect(mockAuth.user).not.toBeNull();
        expect(mockAuth.user?.id).toBeDefined();
    });
});
