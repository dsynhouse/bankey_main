/**
 * GEMINI API MONITOR
 * Tracks API availability and provides status for the application
 */

import { GoogleGenAI } from "@google/genai";

// Get API key (same logic as geminiService)
const getApiKey = () => {
    try {
        if (typeof process !== 'undefined' && process.env?.API_KEY) {
            return process.env.API_KEY;
        }
    } catch { /* Ignore */ }
    try {
        if (import.meta && import.meta.env && import.meta.env.VITE_API_KEY) {
            return import.meta.env.VITE_API_KEY;
        }
    } catch { /* Ignore */ }
    return '';
};

export type GeminiStatus = 'available' | 'rate_limited' | 'offline' | 'unknown';

interface StatusResult {
    status: GeminiStatus;
    message: string;
    resetTime?: Date; // Estimated quota reset (midnight PT)
    lastChecked: Date;
    quotaError?: boolean;
}

// Cache the status to avoid excessive API calls
let cachedStatus: StatusResult | null = null;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Calculate next midnight Pacific Time for quota reset
 */
const getNextMidnightPT = (): Date => {
    const now = new Date();
    // Pacific Time is UTC-8 (or UTC-7 during DST)
    // Get current time in PT
    const ptOffset = -8 * 60; // minutes offset for PST
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const ptMinutes = utcMinutes + ptOffset;

    // Calculate minutes until midnight PT
    let minutesUntilMidnight: number;
    if (ptMinutes < 0) {
        // It's still "yesterday" in PT
        minutesUntilMidnight = -ptMinutes;
    } else {
        minutesUntilMidnight = 24 * 60 - ptMinutes;
    }

    return new Date(now.getTime() + minutesUntilMidnight * 60 * 1000);
};

/**
 * Check Gemini API availability with a minimal test call
 */
export const checkGeminiStatus = async (forceRefresh = false): Promise<StatusResult> => {
    // Return cached status if still valid
    if (!forceRefresh && cachedStatus) {
        const age = Date.now() - cachedStatus.lastChecked.getTime();
        if (age < CACHE_DURATION_MS) {
            return cachedStatus;
        }
    }

    const apiKey = getApiKey();

    if (!apiKey) {
        cachedStatus = {
            status: 'offline',
            message: 'No API key configured',
            lastChecked: new Date()
        };
        return cachedStatus;
    }

    try {
        const ai = new GoogleGenAI({ apiKey });

        // Minimal test call with very short content
        await ai.models.generateContent({
            model: "gemini-2.0-flash-lite",
            contents: "1"
        });

        cachedStatus = {
            status: 'available',
            message: 'API is working',
            lastChecked: new Date()
        };
        return cachedStatus;

    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);

        if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
            cachedStatus = {
                status: 'rate_limited',
                message: 'Quota exceeded - resets at midnight PT',
                resetTime: getNextMidnightPT(),
                lastChecked: new Date(),
                quotaError: true
            };
        } else if (errMsg.includes('billing')) {
            cachedStatus = {
                status: 'offline',
                message: 'Billing issue - check Google Cloud Console',
                lastChecked: new Date()
            };
        } else {
            cachedStatus = {
                status: 'unknown',
                message: errMsg.substring(0, 100),
                lastChecked: new Date()
            };
        }

        return cachedStatus;
    }
};

/**
 * Get cached status without making an API call
 */
export const getCachedStatus = (): StatusResult | null => cachedStatus;

/**
 * Check if API is likely available (uses cache)
 */
export const isApiLikelyAvailable = (): boolean => {
    if (!cachedStatus) return true; // Assume available if never checked
    if (cachedStatus.status === 'available') return true;

    // If rate limited, check if reset time has passed
    if (cachedStatus.status === 'rate_limited' && cachedStatus.resetTime) {
        return new Date() > cachedStatus.resetTime;
    }

    return false;
};

/**
 * Format time until reset in human readable form
 */
export const formatTimeUntilReset = (): string | null => {
    if (!cachedStatus?.resetTime) return null;

    const now = new Date();
    const diff = cachedStatus.resetTime.getTime() - now.getTime();

    if (diff <= 0) return 'Reset time passed - try again';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
        return `~${hours}h ${minutes}m until quota reset`;
    }
    return `~${minutes}m until quota reset`;
};

// Expose to window for debugging in dev
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
    (window as unknown as { checkGeminiStatus: typeof checkGeminiStatus }).checkGeminiStatus = checkGeminiStatus;
}
