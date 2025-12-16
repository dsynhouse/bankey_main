import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBanky } from '../context/useBanky';
import { usePreferences } from '../context/PreferencesContext';
import { useSettings } from '../context/SettingsContext';
import { Currency, ChatMessage } from '../types';
import { getSupportAdvice } from '../services/geminiService';
import { PremiumSettings } from './PremiumSettings';
import {
    User,
    ShieldCheck,
    Globe,
    Download,
    Edit2,
    Save,
    Loader2,
    AlertTriangle,
    HelpCircle,
    Bug,
    Send,
    Bot,
    Smartphone,

    Check,
    LogOut,
    Sparkles
} from 'lucide-react';
import { SEO } from './SEO';



const Settings: React.FC = () => {
    const [searchParams] = useSearchParams();
    // Use main context for user and data operations
    const { user, logout, updateUserName, transactions, accounts } = useBanky();
    const { currency, setCurrency } = usePreferences();

    // Read tab from URL query param (e.g., /settings?tab=premium)
    const urlTab = searchParams.get('tab') as 'profile' | 'preferences' | 'premium' | 'security' | 'support' | null;
    const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'premium' | 'security' | 'support'>(
        urlTab && ['profile', 'preferences', 'premium', 'security', 'support'].includes(urlTab)
            ? urlTab
            : 'preferences'
    );

    // Profile State
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(user?.name || '');
    const [isSavingName, setIsSavingName] = useState(false);

    // Preferences State - Pending Changes
    const [pendingCurrency] = useState<Currency>(currency);
    const [pendingNotifications, setPendingNotifications] = useState(() => {
        const saved = localStorage.getItem('banky_notifs');
        return saved ? JSON.parse(saved) : { budget: true, tips: false, news: true };
    });

    const [isSavingPrefs, setIsSavingPrefs] = useState(false);

    const hasChanges = React.useMemo(() => {
        const savedNotifs = localStorage.getItem('banky_notifs');
        const currentNotifs = savedNotifs ? JSON.parse(savedNotifs) : { budget: true, tips: false, news: true };

        const currencyChanged = pendingCurrency.code !== currency.code;
        const notifsChanged = JSON.stringify(pendingNotifications) !== JSON.stringify(currentNotifs);

        return currencyChanged || notifsChanged;
    }, [pendingCurrency, pendingNotifications, currency]);

    // Support Bot State
    const [supportMessages, setSupportMessages] = useState<ChatMessage[]>(() => [{
        id: '0', role: 'model', text: 'Hi! I\'m the Bankey Support Bot. How can I help you today? (e.g. "How do I add a wallet?")', timestamp: Date.now()
    }]);
    const [supportInput, setSupportInput] = useState('');
    const [isSupportTyping, setIsSupportTyping] = useState(false);
    const supportScrollRef = useRef<HTMLDivElement>(null);

    // Feedback Form State
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackSent, setFeedbackSent] = useState(false);

    // Check for changes


    useEffect(() => {
        if (activeTab === 'support') {
            supportScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [supportMessages, activeTab]);

    const handleUpdateName = async () => {
        if (!newName.trim() || newName === user?.name) {
            setIsEditingName(false);
            return;
        }
        setIsSavingName(true);
        await updateUserName(newName);
        setIsSavingName(false);
        setIsEditingName(false);
    };

    const handleSavePreferences = async () => {
        setIsSavingPrefs(true);

        // 1. Update Currency (Context & DB)
        if (pendingCurrency.code !== currency.code) {
            await setCurrency(pendingCurrency);
        }

        // 2. Update Notifications (Local Storage)
        localStorage.setItem('banky_notifs', JSON.stringify(pendingNotifications));

        // Simulate network delay for feel
        await new Promise(r => setTimeout(r, 800));

        setIsSavingPrefs(false);
    };

    const handleExportData = () => {
        const data = {
            user: user?.name,
            generated_at: new Date().toISOString(),
            accounts,
            transactions,
            settings: {
                currency,
                notifications: pendingNotifications,
                theme: 'light'
            }
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bankey_data_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleSupportSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supportInput.trim()) return;

        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            text: supportInput,
            timestamp: Date.now()
        };

        setSupportMessages(prev => [...prev, userMsg]);
        setSupportInput('');
        setIsSupportTyping(true);

        const history = supportMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
        const response = await getSupportAdvice(history, userMsg.text);

        const botMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'model',
            text: response || "Support systems are currently busy.",
            timestamp: Date.now()
        };

        setSupportMessages(prev => [...prev, botMsg]);
        setIsSupportTyping(false);
    };

    const submitFeedback = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call to admin
        setFeedbackText('');
        setFeedbackSent(true);
        setTimeout(() => setFeedbackSent(false), 3000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in font-sans pb-20">
            <SEO title="Settings" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end border-b-4 border-ink pb-4 gap-4">
                <div>
                    <h1 className="text-5xl font-black text-ink uppercase italic tracking-tighter font-display">Settings</h1>
                    <p className="text-gray-500 font-bold mt-2">Config your setup.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                {/* Settings Sidebar */}
                <div className="col-span-1 flex flex-col gap-2">
                    {[
                        { id: 'profile', label: 'Profile & Login', icon: User },
                        { id: 'preferences', label: 'Preferences', icon: Globe },
                        { id: 'premium', label: 'Premium', icon: Sparkles },
                        { id: 'security', label: 'Security & Data', icon: ShieldCheck },
                        { id: 'support', label: 'Support & Help', icon: HelpCircle },
                    ].map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as typeof activeTab)}
                                className={`text-left px-4 py-4 border-2 border-ink font-bold flex items-center gap-3 transition-all ${isActive
                                    ? 'bg-banky-yellow shadow-neo translate-x-1 -translate-y-1'
                                    : 'bg-white hover:bg-gray-50'
                                    } `}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-display uppercase tracking-wide text-sm">{item.label}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Content Area */}
                <div className="col-span-1 md:col-span-3 bg-white border-2 border-ink shadow-neo p-8 min-h-[500px]">

                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <h2 className="text-2xl font-black uppercase font-display mb-6 border-b-2 border-gray-200 pb-2">My Details</h2>
                                <div className="grid gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-400 mb-1 font-display">Display Name</label>
                                        <div className="flex items-center gap-2">
                                            {isEditingName ? (
                                                <div className="flex items-center gap-2 w-full">
                                                    <input
                                                        autoFocus
                                                        value={newName}
                                                        onChange={(e) => setNewName(e.target.value)}
                                                        className="flex-1 border-2 border-ink p-3 font-bold focus:shadow-neo-sm outline-none bg-ink text-white"
                                                    />
                                                    <button
                                                        onClick={handleUpdateName}
                                                        disabled={isSavingName}
                                                        className="bg-banky-green border-2 border-ink p-3 hover:shadow-neo-sm transition-all"
                                                    >
                                                        {isSavingName ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex-1 flex items-center justify-between border-2 border-ink p-3 bg-gray-50 text-ink">
                                                    <span className="font-bold">{user?.name}</span>
                                                    <button onClick={() => { setNewName(user?.name || ''); setIsEditingName(true); }}>
                                                        <Edit2 className="w-4 h-4 text-gray-400 hover:text-ink" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-400 mb-1 font-display">Email Address</label>
                                        <div className="flex items-center gap-2 border-2 border-ink p-3 bg-gray-50 text-gray-500 cursor-not-allowed">
                                            <span className="font-bold">{user?.email}</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Contact support to update email</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-2xl font-black uppercase font-display mb-6 border-b-2 border-gray-200 pb-2">Account Actions</h2>
                                <button onClick={logout} className="w-full flex items-center justify-center gap-2 text-sm font-black uppercase text-red-500 hover:text-white hover:bg-red-500 border-2 border-red-500 p-4 transition-colors">
                                    <LogOut className="w-4 h-4" /> Sign Out of All Devices
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PREFERENCES TAB */}
                    {activeTab === 'preferences' && (
                        <div className="space-y-8 animate-fade-in relative">

                            {/* Save Changes Button - Floating or Bottom */}
                            <div className={`sticky top-0 z-20 flex justify-end mb-4 transition-all duration-300 ${hasChanges ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'} `}>
                                <button
                                    onClick={handleSavePreferences}
                                    disabled={isSavingPrefs}
                                    className="bg-ink text-white border-2 border-ink px-6 py-3 font-black uppercase shadow-neo hover:bg-banky-green hover:text-ink transition-all flex items-center gap-2 font-display"
                                >
                                    {isSavingPrefs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </div>

                            {/* Theme Settings - Dark mode disabled for now */}
                            {/* Dark mode toggle removed - see SettingsContext.tsx */}

                            <div>
                                <h2 className="text-2xl font-black uppercase font-display mb-6 border-b-2 border-gray-200 pb-2">Regional Settings</h2>

                                {/* Currency selection hidden - INR only for now */}
                                <div className="mb-6">
                                    <label className="block text-sm font-black uppercase text-ink mb-3 font-display">Currency</label>
                                    <div className="flex items-center justify-between p-4 border-2 border-ink bg-banky-green shadow-neo-sm -translate-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 flex items-center justify-center bg-ink text-white font-mono font-bold rounded-full">
                                                ₹
                                            </span>
                                            <div className="text-left">
                                                <p className="font-black font-display">INR</p>
                                                <p className="text-xs font-bold text-gray-600">Indian Rupee</p>
                                            </div>
                                        </div>
                                        <Check className="w-6 h-6" />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 font-medium">More currencies coming soon!</p>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-2xl font-black uppercase font-display mb-6 border-b-2 border-gray-200 pb-2">Notifications</h2>
                                <div className="space-y-3">
                                    {[
                                        { key: 'budget', label: 'Budget Alerts', sub: 'Get notified when you overspend.' },
                                        { key: 'tips', label: 'Financial Tips', sub: 'Daily wisdom from the AI.' },
                                        { key: 'news', label: 'Market News', sub: 'Stay updated on the economy.' },
                                    ].map((item) => (
                                        <div key={item.key} className="flex justify-between items-center p-3 border-b border-gray-100">
                                            <div>
                                                <p className="font-bold text-ink">{item.label}</p>
                                                <p className="text-xs text-gray-500">{item.sub}</p>
                                            </div>
                                            <div
                                                onClick={() => setPendingNotifications({ ...pendingNotifications, [item.key]: !pendingNotifications[item.key as keyof typeof pendingNotifications] })}
                                                className={`w-12 h-6 rounded-full border-2 border-ink flex items-center p-0.5 cursor-pointer transition-colors ${pendingNotifications[item.key as keyof typeof pendingNotifications] ? 'bg-banky-purple' : 'bg-gray-200'} `}
                                            >
                                                <div className={`w-4 h-4 bg-white border-2 border-ink rounded-full transition-transform ${pendingNotifications[item.key as keyof typeof pendingNotifications] ? 'translate-x-6' : 'translate-x-0'} `}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECURITY & DATA TAB */}
                    {activeTab === 'security' && (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <h2 className="text-2xl font-black uppercase font-display mb-6 border-b-2 border-gray-200 pb-2">Login Security</h2>

                                {/* 2FA Explanation Card */}
                                <div className="bg-banky-blue/10 border-2 border-ink p-6 mb-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-white p-3 border-2 border-ink rounded-full shadow-neo-sm">
                                            <Smartphone className="w-8 h-8 text-banky-blue" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-black text-lg uppercase font-display">Passwordless OTP</h3>
                                                <span className="bg-banky-green text-ink text-[10px] px-2 py-0.5 border border-ink font-black uppercase">Active</span>
                                            </div>
                                            <p className="text-sm font-medium text-gray-600 mb-4">
                                                Bankey uses a secure, passwordless login system.
                                                Instead of a password (which can be stolen), we send a unique verification code
                                                to your email or phone every time you log in.
                                            </p>
                                            <div className="bg-white p-3 border border-ink text-xs font-mono text-gray-500 rounded">
                                                <strong>Why is this safer?</strong>
                                                <ul className="list-disc pl-4 mt-1 space-y-1">
                                                    <li>No passwords for hackers to crack.</li>
                                                    <li>Requires physical access to your device/email.</li>
                                                    <li>Acts as automatic Two-Factor Verification.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-2xl font-black uppercase font-display mb-6 border-b-2 border-gray-200 pb-2">Your Data</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={handleExportData}
                                        className="flex flex-col items-center justify-center p-6 border-2 border-ink bg-white hover:bg-gray-50 transition-colors gap-3 group"
                                    >
                                        <Download className="w-8 h-8 text-ink group-hover:scale-110 transition-transform" />
                                        <div className="text-center">
                                            <span className="font-black uppercase font-display block">Export Data</span>
                                            <span className="text-xs text-gray-500">Download JSON backup</span>
                                        </div>
                                    </button>
                                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-red-300 bg-red-50 gap-3 opacity-75 hover:opacity-100 transition-opacity cursor-not-allowed" title="Coming Soon">
                                        <AlertTriangle className="w-8 h-8 text-red-400" />
                                        <div className="text-center">
                                            <span className="font-black uppercase font-display block text-red-500">Delete Account</span>
                                            <span className="text-xs text-red-400">Permanently erase data</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PREMIUM TAB */}
                    {activeTab === 'premium' && (
                        <div className="animate-fade-in">
                            <PremiumSettings />
                        </div>
                    )}

                    {/* SUPPORT & HELP TAB (NEW) */}
                    {activeTab === 'support' && (
                        <div className="space-y-8 animate-fade-in h-full flex flex-col">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">

                                {/* 1. Support Chatbot */}
                                <div className="border-2 border-ink flex flex-col h-[400px]">
                                    <div className="bg-banky-pink p-3 border-b-2 border-ink flex items-center justify-between">
                                        <h3 className="font-black uppercase font-display text-white flex items-center gap-2"><Bot className="w-5 h-5" /> Support Bot</h3>
                                        <div className="text-[10px] font-bold bg-white/20 text-white px-2 rounded">AI Powered</div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 bg-gray-50 p-4 overflow-y-auto space-y-3">
                                        {supportMessages.map((msg) => (
                                            <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''} `}>
                                                <div className={`w-8 h-8 rounded-full border border-ink flex items-center justify-center flex-shrink-0 ${msg.role === 'model' ? 'bg-banky-pink text-white' : 'bg-ink text-white'} `}>
                                                    {msg.role === 'model' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                                </div>
                                                <div className={`max-w-[80%] p-2 rounded text-sm font-medium border border-ink ${msg.role === 'model' ? 'bg-white' : 'bg-ink text-white'} `}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        ))}
                                        {isSupportTyping && <div className="text-xs text-gray-400 animate-pulse pl-10">Bot is typing...</div>}
                                        <div ref={supportScrollRef} />
                                    </div>

                                    {/* Input */}
                                    <form onSubmit={handleSupportSend} className="p-2 border-t-2 border-ink bg-white flex gap-2">
                                        <input
                                            className="flex-1 border-2 border-gray-300 p-2 text-sm font-bold focus:border-ink outline-none"
                                            placeholder="Type your issue..."
                                            value={supportInput}
                                            onChange={e => setSupportInput(e.target.value)}
                                        />
                                        <button type="submit" disabled={isSupportTyping || !supportInput.trim()} className="bg-ink text-white p-2 border-2 border-transparent hover:bg-gray-800 disabled:opacity-50"><Send className="w-4 h-4" /></button>
                                    </form>
                                </div>

                                {/* 2. Feedback Form */}
                                <div className="flex flex-col">
                                    <h3 className="font-black uppercase font-display text-xl mb-4 flex items-center gap-2"><Bug className="w-5 h-5 text-red-500" /> Report a Bug</h3>
                                    <p className="text-sm text-gray-600 font-medium mb-4">
                                        Found a glitch? Have an idea? Send a direct message to the admin.
                                    </p>

                                    <form onSubmit={submitFeedback} className="flex-1 flex flex-col">
                                        <textarea
                                            required
                                            className="flex-1 w-full border-2 border-ink p-4 font-mono text-sm bg-gray-50 focus:bg-white outline-none resize-none mb-4"
                                            placeholder="Describe the issue or feature request..."
                                            value={feedbackText}
                                            onChange={e => setFeedbackText(e.target.value)}
                                        ></textarea>
                                        <button
                                            type="submit"
                                            disabled={feedbackSent}
                                            className={`w-full py-3 font-black uppercase border-2 border-ink shadow-neo transition-all ${feedbackSent ? 'bg-green-500 text-white border-green-700' : 'bg-white hover:bg-gray-50'} `}
                                        >
                                            {feedbackSent ? 'Sent! Thanks.' : 'Send Feedback'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Settings;