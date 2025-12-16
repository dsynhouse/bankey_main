import * as Sentry from '@sentry/react';

/**
 * Centralized error handler for Supabase operations
 */
export function handleSupabaseError(error: any, context: string): void {
    // Log to console in development
    if (import.meta.env.DEV) {
        console.error(`[${context}]:`, error);
    }

    // Send to Sentry in production
    if (import.meta.env.PROD) {
        Sentry.captureException(error, {
            tags: {
                context,
                type: 'supabase_error'
            },
            extra: {
                errorDetails: error
            }
        });
    }
}

/**
 * Get user-friendly error message from Supabase error
 */
export function getErrorMessage(error: any): string {
    if (!error) return 'An unknown error occurred';

    // Supabase-specific error messages
    if (error.code) {
        switch (error.code) {
            case '23505':
                return 'This item already exists';
            case '23503':
                return 'Cannot complete this action due to related data';
            case 'PGRST116':
                return 'No data found';
            case '42501':
                return 'You do not have permission to perform this action';
            default:
                return error.message || 'A database error occurred';
        }
    }

    // Network errors
    if (error.message?.includes('Failed to fetch')) {
        return 'Network error. Please check your connection';
    }

    return error.message || 'An error occurred';
}

/**
 * Handle errors with user notification (if toast library is available)
 */
export function handleErrorWithNotification(
    error: any,
    context: string,
    showToast?: (message: string, type: 'error' | 'success') => void
): void {
    handleSupabaseError(error, context);

    const message = getErrorMessage(error);

    if (showToast) {
        showToast(message, 'error');
    }
}

/**
 * Async wrapper with error handling
 */
export async function withErrorHandling<T>(
    fn: () => Promise<T>,
    context: string,
    onError?: (error: any) => void
): Promise<{ data: T | null; error: any }> {
    try {
        const data = await fn();
        return { data, error: null };
    } catch (error) {
        handleSupabaseError(error, context);
        onError?.(error);
        return { data: null, error };
    }
}
