import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Activity, CheckCircle, XCircle, AlertTriangle, Lock, Unlock } from 'lucide-react';
import GeminiHealthBoard from './GeminiHealthBoard';

interface CheckResult {
    name: string;
    status: 'pending' | 'success' | 'error' | 'warning';
    message?: string;
    details?: string;
}

const HealthCheck: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    const [checks, setChecks] = useState<CheckResult[]>([
        { name: 'Environment Configuration', status: 'pending' },
        { name: 'Supabase Connection', status: 'pending' },
        { name: 'Authentication Service', status: 'pending' },
        { name: 'Database Access (Profiles)', status: 'pending' },
        { name: 'Edge Functions Config', status: 'pending' }
    ]);



    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple client-side check for dev/admin
        if (pin === 'admin') {
            setIsAuthenticated(true);
        } else {
            setError('Invalid Admin PIN');
        }
    };

    const updateCheck = (name: string, status: CheckResult['status'], message?: string, details?: string) => {
        setChecks(prev => prev.map(c => c.name === name ? { ...c, status, message, details } : c));
    };

    const runDiagnostics = useCallback(async () => {
        // 1. Environment Config
        try {
            const envUrl = import.meta.env.VITE_SUPABASE_URL;
            const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            if (envUrl && envKey) {
                updateCheck('Environment Configuration', 'success', 'Env Variables Loaded', `URL: ${envUrl.substring(0, 15)}...`);
            } else {
                updateCheck('Environment Configuration', 'warning', 'Using Hardcoded Config', 'VITE_ variables missing, falling back to supabase.ts consts.');
            }
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : 'Unknown error';
            updateCheck('Environment Configuration', 'error', 'Error reading env', message);
        }

        // 2. Supabase Connection (Network) & 3. Auth Service
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                updateCheck('Authentication Service', 'error', 'Auth Error', error.message);
                updateCheck('Supabase Connection', 'warning', 'Connected but Auth failed');
            } else {
                updateCheck('Authentication Service', 'success', 'Auth Service Reachable', data.session ? 'User Logged In' : 'No Active Session');
                updateCheck('Supabase Connection', 'success', 'Connected to Supabase');
            }
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : 'Unknown error';
            updateCheck('Supabase Connection', 'error', 'Connection Failed', message);
            updateCheck('Authentication Service', 'error', 'Unreachable');
        }

        // 4. Database Access
        try {
            const { count, error } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            if (error) {
                updateCheck('Database Access (Profiles)', 'error', 'Query Failed', error.message);
            } else {
                updateCheck('Database Access (Profiles)', 'success', 'Table Accessible', `Row count: ${count}`);
            }
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : 'Unknown error';
            updateCheck('Database Access (Profiles)', 'error', 'Query Exception', message);
        }

        // 5. Edge Functions check (Static inference)
        const sbUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ruvjgktheazdfhwptelp.supabase.co';
        if (sbUrl) {
            const functionsUrl = sbUrl.replace('.co', '.co/functions/v1');
            updateCheck('Edge Functions Config', 'success', 'URL Inferred', functionsUrl);
        } else {
            updateCheck('Edge Functions Config', 'warning', 'Cannot infer URL');
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            runDiagnostics();
        }
    }, [isAuthenticated, runDiagnostics]);



    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-paper flex items-center justify-center p-4 animate-fade-in font-sans">
                <div className="bg-white border-4 border-ink shadow-neo p-8 max-w-sm w-full text-center">
                    <div className="w-16 h-16 bg-ink rounded-full flex items-center justify-center mx-auto mb-4 p-3 shadow-neo">
                        <Lock className="w-8 h-8 text-banky-yellow" />
                    </div>
                    <h1 className="text-2xl font-black uppercase font-display mb-2">Admin Diagnostic</h1>
                    <p className="text-sm font-bold text-gray-500 mb-6 uppercase">Enter PIN to access system health.</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            autoFocus
                            placeholder="PIN"
                            value={pin}
                            onChange={(e) => { setPin(e.target.value); setError(''); }}
                            className="w-full border-2 border-ink p-3 text-center text-xl font-bold tracking-[0.5em] outline-none focus:bg-gray-50"
                            maxLength={8}
                        />
                        {error && <p className="text-xs font-black text-red-500 bg-red-50 p-2 border border-red-200">{error}</p>}
                        <button
                            type="submit"
                            className="w-full bg-ink text-white py-3 font-black uppercase shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                        >
                            Unlock <Unlock className="w-4 h-4 inline-block ml-1" />
                        </button>
                    </form>
                    <p className="mt-4 text-[10px] text-gray-400 font-mono">Hint: Use 'admin'</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans animate-fade-in">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Activity className="w-8 h-8 text-banky-blue" />
                        <h1 className="text-3xl font-black uppercase font-display text-ink">System Health Diagnostic</h1>
                    </div>
                    <button onClick={() => setIsAuthenticated(false)} className="text-sm font-bold underline decoration-2 decoration-ink">
                        Lock
                    </button>
                </div>

                <div className="bg-white border-4 border-ink shadow-neo rounded-lg overflow-hidden">
                    {checks.map((check, idx) => (
                        <div key={idx} className="p-4 border-b-2 border-gray-100 last:border-0 flex items-start justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    {check.status === 'pending' && <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-ink animate-spin"></div>}
                                    {check.status === 'success' && <CheckCircle className="w-6 h-6 text-green-500 fill-current bg-white rounded-full" />}
                                    {check.status === 'error' && <XCircle className="w-6 h-6 text-red-500 fill-current bg-white rounded-full" />}
                                    {check.status === 'warning' && <AlertTriangle className="w-6 h-6 text-orange-500 fill-current bg-white rounded-full" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-ink">{check.name}</h3>
                                    {check.message && <p className={`text-sm font-bold uppercase ${check.status === 'success' ? 'text-green-600' :
                                        check.status === 'error' ? 'text-red-500' :
                                            check.status === 'warning' ? 'text-orange-500' : 'text-gray-500'
                                        }`}>{check.message}</p>}
                                    {check.details && <p className="text-xs font-mono text-gray-400 mt-1 bg-gray-100 p-1 rounded inline-block">{check.details}</p>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Gemini Tracker */}
                <GeminiHealthBoard />

                <div className="mt-8 text-center">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-ink text-white font-black uppercase shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                    >
                        Re-run Diagnostics
                    </button>
                    <p className="mt-4 text-xs font-bold text-gray-400 uppercase">
                        Bankey System v2.0 • {(new Date()).toISOString()}
                    </p>
                    <div className="mt-6">
                        <a href="#/dashboard" className="text-sm font-bold text-ink hover:underline decoration-2">
                            ← Go to Dashboard
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthCheck;
