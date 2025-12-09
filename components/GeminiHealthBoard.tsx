import React, { useEffect, useState } from 'react';
import { geminiUsage, GeminiLog, GeminiStats } from '../services/geminiUsage';
import { RefreshCw, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';

const GeminiHealthBoard: React.FC = () => {
    const [stats, setStats] = useState<GeminiStats | null>(null);
    const [logs, setLogs] = useState<GeminiLog[]>([]);

    const refreshData = () => {
        setStats(geminiUsage.getStats());
        setLogs(geminiUsage.getLogs());
    };

    useEffect(() => {
        refreshData();
        // Auto-refresh every 5s
        const interval = setInterval(refreshData, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleClear = () => {
        if (confirm('Clear all Gemini usage history?')) {
            geminiUsage.clearLogs();
            refreshData();
        }
    };

    if (!stats) return null;

    return (
        <div className="mt-8 bg-white border-4 border-ink shadow-neo rounded-lg overflow-hidden animate-fade-in">
            <div className="p-4 bg-gray-50 border-b-2 border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-black uppercase text-ink">Gemini API Usage (24h)</h2>
                <div className="flex gap-2">
                    <button onClick={refreshData} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <RefreshCw className="w-5 h-5 text-gray-600" />
                    </button>
                    <button onClick={handleClear} className="p-2 hover:bg-red-100 rounded-full transition-colors">
                        <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-center">
                    <p className="text-xs font-bold text-blue-400 uppercase">Requests</p>
                    <p className="text-2xl font-black text-blue-600">{stats.totalRequests}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-100 text-center">
                    <p className="text-xs font-bold text-green-400 uppercase">Success</p>
                    <p className="text-2xl font-black text-green-600">{stats.successfulRequests}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-100 text-center">
                    <p className="text-xs font-bold text-red-400 uppercase">Errors</p>
                    <p className="text-2xl font-black text-red-600">{stats.failedRequests}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 text-center">
                    <p className="text-xs font-bold text-purple-400 uppercase">Avg Latency</p>
                    <p className="text-2xl font-black text-purple-600">{stats.avgLatency}ms</p>
                </div>
            </div>

            {/* Logs Table */}
            <div className="border-t-2 border-gray-100 max-h-64 overflow-y-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="p-3 font-bold text-gray-400 uppercase text-xs">Time</th>
                            <th className="p-3 font-bold text-gray-400 uppercase text-xs">Feature</th>
                            <th className="p-3 font-bold text-gray-400 uppercase text-xs">Model</th>
                            <th className="p-3 font-bold text-gray-400 uppercase text-xs">Result</th>
                            <th className="p-3 font-bold text-gray-400 uppercase text-xs">Latency</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-400 italic">No usage logged yet.</td>
                            </tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="p-3 font-mono text-gray-600">
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                    </td>
                                    <td className="p-3 font-bold text-ink">{log.feature}</td>
                                    <td className="p-3 font-mono text-xs text-gray-500">{log.model}</td>
                                    <td className="p-3">
                                        {log.success ? (
                                            <span className="flex items-center gap-1 text-green-600 font-bold text-xs uppercase">
                                                <CheckCircle className="w-3 h-3" /> OK
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-red-600 font-bold text-xs uppercase" title={log.error}>
                                                <XCircle className="w-3 h-3" /> {log.error?.substring(0, 15)}...
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3 font-mono text-gray-600">{log.duration}ms</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GeminiHealthBoard;
