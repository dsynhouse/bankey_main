/**
 * Performance utilities for React components.
 * These patterns help avoid unnecessary re-renders and improve app performance.
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';

/**
 * Hook that returns a stable callback reference.
 * Unlike useCallback, this always returns the same reference.
 * Useful when you want to avoid re-renders but need the latest closure values.
 * 
 * @example
 * const handleClick = useStableCallback(() => {
 *   console.log(latestValue); // Always has latest value
 * });
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(
    callback: T
): T {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    });

    return useCallback((...args: Parameters<T>) => {
        return callbackRef.current(...args);
    }, []) as T;
}

/**
 * Hook that tracks if a component is mounted.
 * Useful for preventing state updates on unmounted components.
 * 
 * @example
 * const isMounted = useIsMounted();
 * useEffect(() => {
 *   fetchData().then(data => {
 *     if (isMounted()) setData(data);
 *   });
 * }, []);
 */
export function useIsMounted(): () => boolean {
    const isMountedRef = useRef(false);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    return useCallback(() => isMountedRef.current, []);
}

/**
 * Hook for debouncing a value.
 * Useful for search inputs, auto-save, etc.
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 300);
 */
export function useDebounce<T>(value: T, delayMs: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delayMs);

        return () => clearTimeout(timer);
    }, [value, delayMs]);

    return debouncedValue;
}

/**
 * Hook that runs an effect only on updates, not on mount.
 * 
 * @example
 * useUpdateEffect(() => {
 *   console.log('Value changed!', value);
 * }, [value]);
 */
export function useUpdateEffect(
    effect: React.EffectCallback,
    deps?: React.DependencyList
): void {
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            return effect();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}

/**
 * Hook for tracking previous value.
 * Useful for comparing values between renders.
 * Returns undefined on first render, then the previous value.
 * 
 * Note: This hook stores the previous value in state to avoid
 * accessing refs during render (which is not allowed by React strict mode).
 * 
 * @example
 * const prevCount = usePrevious(count);
 * useEffect(() => {
 *   if (prevCount !== undefined && prevCount !== count) {
 *     console.log('Count changed from', prevCount, 'to', count);
 *   }
 * }, [count, prevCount]);
 */
export function usePrevious<T>(value: T): T | undefined {
    const [current, setCurrent] = useState<T>(value);
    const [previous, setPrevious] = useState<T | undefined>(undefined);

    if (value !== current) {
        setPrevious(current);
        setCurrent(value);
    }

    return previous;
}
