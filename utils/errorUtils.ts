/**
 * Utility functions for consistent error handling across the application.
 * These promote production-grade error handling patterns.
 */

/**
 * Type-safe error message extraction from unknown error types.
 * Use this in catch blocks instead of assuming error has a message property.
 * 
 * @example
 * try {
 *   await someAsyncOperation();
 * } catch (error) {
 *   console.error(getErrorMessage(error));
 * }
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
        return String(error.message);
    }
    return 'An unknown error occurred';
}

/**
 * Wraps an async function with standardized error handling.
 * Useful for form submissions, API calls, etc.
 * 
 * @example
 * const [submitForm, isLoading, error] = useAsyncHandler(async (data) => {
 *   await api.submit(data);
 * });
 */
export async function safeAsync<T>(
    fn: () => Promise<T>,
    options?: {
        onError?: (error: Error) => void;
        fallback?: T;
    }
): Promise<{ data: T | undefined; error: string | null }> {
    try {
        const data = await fn();
        return { data, error: null };
    } catch (e) {
        const errorMessage = getErrorMessage(e);
        options?.onError?.(e instanceof Error ? e : new Error(errorMessage));
        return { data: options?.fallback, error: errorMessage };
    }
}

/**
 * Retry an async operation with exponential backoff.
 * Useful for network requests that may fail transiently.
 * 
 * @example
 * const result = await retryAsync(() => fetchData(), { maxRetries: 3 });
 */
export async function retryAsync<T>(
    fn: () => Promise<T>,
    options: {
        maxRetries?: number;
        delayMs?: number;
        backoffMultiplier?: number;
    } = {}
): Promise<T> {
    const { maxRetries = 3, delayMs = 1000, backoffMultiplier = 2 } = options;

    let lastError: unknown;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (attempt < maxRetries - 1) {
                await new Promise(resolve =>
                    setTimeout(resolve, delayMs * Math.pow(backoffMultiplier, attempt))
                );
            }
        }
    }

    throw lastError;
}

/**
 * Debounce an async function.
 * Useful for search inputs, auto-save, etc.
 */
export function debounceAsync<T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T,
    delayMs: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    let timeoutId: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        return new Promise((resolve, reject) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(async () => {
                try {
                    const result = await fn(...args);
                    resolve(result as ReturnType<T>);
                } catch (error) {
                    reject(error);
                }
            }, delayMs);
        });
    };
}
