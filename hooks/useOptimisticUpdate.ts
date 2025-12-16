import { useState } from 'react';

/**
 * Generic hook for optimistic UI updates with automatic rollback on error
 * 
 * @example
 * const addTransaction = useOptimisticUpdate({
 *   state: [transactions, setTransactions],
 *   updateFn: (items, newItem) => [newItem, ...items],
 *   onUpdate: (tx) => saveTransaction(supabase, user.id, tx),
 *   onError: (error) => console.error('Failed to save transaction:', error)
 * });
 */
export function useOptimisticUpdate<T extends { id: string }>({
    state,
    updateFn,
    onUpdate,
    onError,
    onSuccess
}: {
    state: [T[], React.Dispatch<React.SetStateAction<T[]>>];
    updateFn?: (items: T[], newItem: T) => T[];
    onUpdate: (item: T) => Promise<{ error?: any }>;
    onError?: (error: any) => void;
    onSuccess?: (item: T) => void;
}) {
    const [items, setItems] = state;
    const [isLoading, setIsLoading] = useState(false);

    const execute = async (itemData: Omit<T, 'id'>) => {
        setIsLoading(true);

        // Create optimistic item with UUID
        const optimisticItem = {
            ...itemData,
            id: crypto.randomUUID()
        } as T;

        // Optimistically update UI
        const updatedItems = updateFn
            ? updateFn(items, optimisticItem)
            : [...items, optimisticItem];

        setItems(updatedItems);

        try {
            // Attempt to persist
            const { error } = await onUpdate(optimisticItem);

            if (error) {
                // Rollback on error
                setItems(items);
                onError?.(error);
                throw error;
            }

            // Success callback
            onSuccess?.(optimisticItem);
            return { data: optimisticItem, error: null };
        } catch (error) {
            // Ensure rollback on exception
            setItems(items);
            onError?.(error);
            return { data: null, error };
        } finally {
            setIsLoading(false);
        }
    };

    return { execute, isLoading };
}

/**
 * Hook for optimistic delete operations
 */
export function useOptimisticDelete<T extends { id: string }>({
    state,
    onDelete,
    onError
}: {
    state: [T[], React.Dispatch<React.SetStateAction<T[]>>];
    onDelete: (id: string) => Promise<{ error?: any }>;
    onError?: (error: any) => void;
}) {
    const [items, setItems] = state;
    const [isLoading, setIsLoading] = useState(false);

    const execute = async (id: string) => {
        setIsLoading(true);

        // Store the item for potential rollback
        const itemToDelete = items.find(item => item.id === id);
        if (!itemToDelete) {
            setIsLoading(false);
            return { error: new Error('Item not found') };
        }

        // Optimistically remove from UI
        setItems(prev => prev.filter(item => item.id !== id));

        try {
            const { error } = await onDelete(id);

            if (error) {
                // Rollback on error
                setItems(items);
                onError?.(error);
                throw error;
            }

            return { error: null };
        } catch (error) {
            // Ensure rollback on exception
            setItems(items);
            onError?.(error);
            return { error };
        } finally {
            setIsLoading(false);
        }
    };

    return { execute, isLoading };
}
