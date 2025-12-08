import React, { useState } from 'react';
import { Bell, Send, ShieldCheck, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import { sendNotification } from '../services/notificationService';
import { SEO } from './SEO';

const AdminNotifications: React.FC = () => {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [authError, setAuthError] = useState('');

    // Notification State
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [segment, setSegment] = useState('All'); // 'All', 'Active Users', 'Inactive Users'
    const [isSending, setIsSending] = useState(false);
    const [result, setResult] = useState<{ success: boolean; msg: string } | null>(null);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple internal PIN check (Same as HealthCheck)
        if (pin === 'admin') {
            setIsAuthenticated(true);
            setAuthError('');
        } else {
            setAuthError('Access Denied');
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        setResult(null);

        try {
            await sendNotification(title, message, segment);
            setResult({ success: true, msg: 'Notification Dispatched Successfully!' });
            // content reset
            setTitle('');
            setMessage('');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setResult({ success: false, msg: err.message || 'Failed to dispatch notification.' });
        } finally {
            setIsSending(false);
        }
    };

    // --- RENDER: LOGIN FORM ---
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-paper flex items-center justify-center p-4">
                <SEO title="Admin Notifications" />
                <div className="bg-white border-4 border-ink shadow-neo-lg p-8 max-w-md w-full text-center">
                    <ShieldCheck className="w-16 h-16 text-banky-green mx-auto mb-4" />
                    <h1 className="text-2xl font-black uppercase font-display mb-2">Admin Access</h1>
                    <p className="font-bold text-gray-500 mb-6">Notification Control Center</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="Enter PIN"
                            className="w-full border-2 border-ink p-3 font-bold text-center outline-none focus:bg-yellow-50"
                            autoFocus
                        />
                        {authError && <p className="text-red-500 font-bold text-sm animate-shake">{authError}</p>}
                        <button
                            type="submit"
                            className="w-full py-3 bg-ink text-white font-black uppercase hover:bg-banky-yellow hover:text-ink transition-colors"
                        >
                            Unlock Panel
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // --- RENDER: NOTIFICATION PANEL ---
    return (
        <div className="min-h-screen bg-paper p-6 md:p-12 font-sans">
            <SEO title="Notification Center" />
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-banky-yellow p-3 border-2 border-ink shadow-neo">
                        <Bell className="w-8 h-8 text-ink" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black uppercase font-display italic">
                            Notify<span className="text-banky-pink">Squad</span>
                        </h1>
                        <p className="font-bold text-gray-500">Push notifications to all devices (Web & Mobile).</p>
                        <div className="bg-green-100 text-green-800 text-xs font-mono py-1 px-2 mt-2 inline-block rounded border border-green-300">
                            v2.5 AUTO-PUSH WORKAROUND
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white border-4 border-ink shadow-neo-lg p-6 relative">
                            {/* Sticker */}
                            <div className="absolute -top-3 -right-3 bg-banky-green text-ink text-xs font-black uppercase px-2 py-1 transform rotate-3 border-2 border-ink">
                                LIVE SYSTEM
                            </div>

                            <form onSubmit={handleSend} className="space-y-6">
                                <div>
                                    <label className="block font-black uppercase text-sm mb-2 flex items-center gap-2">
                                        <Users className="w-4 h-4" /> Target Audience
                                    </label>
                                    <select
                                        value={segment}
                                        onChange={(e) => setSegment(e.target.value)}
                                        className="w-full border-2 border-ink p-3 font-bold bg-gray-50 outline-none focus:shadow-neo-sm"
                                    >
                                        <option value="All">All Users</option>
                                        <option value="Active Users">Active Users (Last 24h)</option>
                                        <option value="Inactive Users">Inactive Users (7 Days+)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-black uppercase text-sm mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Double XP Weekend! 🚀"
                                        className="w-full border-2 border-ink p-3 font-bold outline-none focus:shadow-neo-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-black uppercase text-sm mb-2">Message</label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="e.g. Log in now to claim your weekly bonus..."
                                        className="w-full border-2 border-ink p-3 font-bold outline-none h-32 resize-none focus:shadow-neo-sm"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSending}
                                    className="w-full py-4 bg-ink text-banky-yellow font-black uppercase tracking-wider text-xl hover:bg-banky-pink hover:text-white transition-all shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSending ? 'Dispatching...' : (
                                        <>
                                            <Send className="w-6 h-6" /> Send Notification
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {result && (
                            <div className={`border-2 border-ink p-4 font-bold flex items-center gap-3 animate-fade-in ${result.success ? 'bg-banky-green text-ink' : 'bg-red-100 text-red-600'
                                }`}>
                                {result.success ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                                {result.msg}
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Preview / Info */}
                    <div className="space-y-6">
                        {/* Device Preview */}
                        <div className="bg-gray-100 border-2 border-gray-300 p-6 rounded-3xl relative mx-auto w-64 h-[500px] border-4 border-ink shadow-neo">
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-ink rounded-b-xl"></div>

                            {/* Notification Preview Card */}
                            <div className="mt-12 bg-white/90 backdrop-blur p-3 rounded-2xl shadow-sm border border-gray-200 animate-slide-in">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 bg-banky-yellow rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Bell className="w-6 h-6 text-ink" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold text-xs text-gray-900 truncate">Bankey</p>
                                            <span className="text-[10px] text-gray-500">now</span>
                                        </div>
                                        <p className="font-bold text-sm text-gray-900 truncate">{title || 'Notification Title'}</p>
                                        <p className="text-xs text-gray-600 line-clamp-2">{message || 'Your message will appear here exactly like this on the user\'s device.'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 border-l-4 border-banky-blue p-4 text-sm font-bold text-blue-900">
                            <p>ℹ️ <strong>Note:</strong> Delivery depends on user permissions. Mobile users (APK) are opted-in by default.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminNotifications;
