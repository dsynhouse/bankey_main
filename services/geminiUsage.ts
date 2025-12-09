export interface GeminiLog {
    id: string;
    timestamp: number;
    feature: string;
    model: string;
    duration: number;
    success: boolean;
    error?: string;
}

export interface GeminiStats {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    avgLatency: number;
    lastRequestTime: number | null;
}

const STORAGE_KEY = 'gemini_usage_logs';
const MAX_LOGS = 100;

export const geminiUsage = {
    logRequest: (feature: string, model: string, duration: number, success: boolean, error?: string) => {
        try {
            const newLog: GeminiLog = {
                id: Math.random().toString(36).substr(2, 9),
                timestamp: Date.now(),
                feature,
                model,
                duration,
                success,
                error
            };

            const existingLogs = geminiUsage.getLogs();
            const updatedLogs = [newLog, ...existingLogs].slice(0, MAX_LOGS);

            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
        } catch (e) {
            console.warn('Failed to log Gemini usage', e);
        }
    },

    getLogs: (): GeminiLog[] => {
        try {
            const logs = localStorage.getItem(STORAGE_KEY);
            return logs ? JSON.parse(logs) : [];
        } catch {
            return [];
        }
    },

    getStats: (): GeminiStats => {
        const logs = geminiUsage.getLogs();
        // Filter for logs from last 24h
        const recentLogs = logs.filter(log => (Date.now() - log.timestamp) < 24 * 60 * 60 * 1000);

        const total = recentLogs.length;
        const success = recentLogs.filter(l => l.success).length;
        const failed = total - success;
        const totalDuration = recentLogs.reduce((acc, curr) => acc + curr.duration, 0);

        return {
            totalRequests: total,
            successfulRequests: success,
            failedRequests: failed,
            avgLatency: total > 0 ? Math.round(totalDuration / total) : 0,
            lastRequestTime: logs.length > 0 ? logs[0].timestamp : null
        };
    },

    clearLogs: () => {
        localStorage.removeItem(STORAGE_KEY);
    }
};
