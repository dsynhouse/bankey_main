import React from 'react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { useBanky } from './context/useBanky';

// Mock dependencies
vi.mock('./context/useBanky', () => ({
    useBanky: vi.fn(),
}));

vi.mock('./context/BankyContext', () => ({
    BankyProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('./services/supabase', () => ({
    supabase: {
        auth: {
            getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
        },
    },
}));

// Mock child components to simplify testing routing logic
vi.mock('./components/LandingPage', () => ({ default: () => <div>Landing Page</div> }));
vi.mock('./components/Dashboard', () => ({ default: () => <div>Dashboard</div> }));
vi.mock('./components/Login', () => ({ default: () => <div>Login Page</div> }));
vi.mock('./components/Layout', () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock('lucide-react', async () => {
    const actual = await vi.importActual('lucide-react');
    return {
        ...actual,
        Loader2: () => <div data-testid="loader">Loader</div>,
    };
});

describe('App Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders Landing Page on root route when not authenticated', async () => {
        (useBanky as unknown as Mock).mockReturnValue({ isAuthenticated: false, isLoading: false });

        // We need to manipulate window.location.hash for the initial check in App
        window.location.hash = '';

        render(<App />);

        await waitFor(() => {
            expect(screen.getByText('Landing Page')).toBeInTheDocument();
        });
    });

    it('redirects to Login when accessing protected route while unauthenticated', async () => {
        (useBanky as unknown as Mock).mockReturnValue({ isAuthenticated: false, isLoading: false });

        // Set URL to /dashboard
        window.history.pushState({}, 'Test page', '/#/dashboard');

        render(<App />);

        await waitFor(() => {
            expect(screen.getByText('Login Page')).toBeInTheDocument();
        });
    });

    it('renders Dashboard when authenticated', async () => {
        (useBanky as unknown as Mock).mockReturnValue({ isAuthenticated: true, isLoading: false });

        // Set URL to /dashboard
        window.history.pushState({}, 'Test page', '/#/dashboard');

        render(<App />);

        await waitFor(() => {
            expect(screen.getByText('Dashboard')).toBeInTheDocument();
        });
    });

    it('shows loading state when loading', async () => {
        // App itself has a loading state (isReady) and RequireAuth has one too.
        // App's isReady depends on useEffect.
        // RequireAuth depends on useBanky isLoading.

        (useBanky as unknown as Mock).mockReturnValue({ isAuthenticated: false, isLoading: true });

        render(<App />);
        // Initial App loading
        expect(screen.getByTestId('loader')).toBeInTheDocument();

        // Wait for App to be ready
        await waitFor(() => {
            // If we are at root, we see Landing Page (PublicRouteWrapper checks loading too)
            // PublicRouteWrapper returns null if loading.
            // So we might see nothing or Layout.
        });
    });
});
