import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Mic, MicOff, Loader2, X, Check, AlertCircle } from 'lucide-react';
import { useBanky } from '../context/useBanky';
import { usePremium } from '../context/usePremium';
import { Link } from 'react-router-dom';
import {
    isVoiceSupported,
    startRecording,
    stopRecording,
    cancelRecording,
    blobToBase64
} from '../services/voiceService';
import { parseVoiceTransaction, ParsedVoiceTransaction } from '../services/geminiService';
import { Category } from '../types';

type VoiceState = 'idle' | 'recording' | 'processing' | 'confirming' | 'error' | 'premium-gate';

interface VoiceInputProps {
    onClose: () => void;
    defaultAccountId?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onClose, defaultAccountId }) => {
    const { addTransaction, accounts, currency } = useBanky();
    const { isPremium } = usePremium();

    // Compute initial state based on premium status and voice support
    const getInitialState = (): VoiceState => {
        if (!isPremium) return 'premium-gate';
        if (!isVoiceSupported()) return 'error';
        return 'idle';
    };

    const [state, setState] = useState<VoiceState>(getInitialState);
    const [result, setResult] = useState<ParsedVoiceTransaction | null>(null);
    const [error, setError] = useState<string>(() => {
        if (!isPremium) return '';
        if (!isVoiceSupported()) return 'Voice recording is not supported in this browser';
        return '';
    });
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [selectedAccountId, setSelectedAccountId] = useState(defaultAccountId || accounts[0]?.id || '');

    // Editable fields
    const [editAmount, setEditAmount] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editCategory, setEditCategory] = useState<Category>(Category.OTHER);
    const [editType, setEditType] = useState<'expense' | 'income'>('expense');

    // Deterministic waveform heights for animation (memoized to avoid re-computation)
    const waveformHeights = useMemo(() => [35, 48, 28, 55, 42, 30, 50, 38, 45, 32, 52, 40], []);

    const handleStopRecording = useCallback(async () => {
        try {
            setState('processing');
            const { blob, mimeType } = await stopRecording();

            // Convert to base64 and send to Gemini
            const base64 = await blobToBase64(blob);
            const parsed = await parseVoiceTransaction(base64, mimeType);

            if (parsed) {
                setResult(parsed);
                setEditAmount(parsed.amount.toString());
                setEditDescription(parsed.description);
                setEditCategory(parsed.category as Category);
                setEditType(parsed.type);
                setState('confirming');
            } else {
                setError('Could not understand the audio. Please try again.');
                setState('error');
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to process audio. Please try again.';
            // Show quota-specific message if it's a quota error
            if (message.includes('quota') || message.includes('rate limit')) {
                setError('AI quota limit reached. Voice input will resume at midnight PT. You can manually add transactions in the meantime.');
            } else {
                setError(message);
            }
            setState('error');
        }
    }, []);

    // Recording timer - uses interval which is an external system
    useEffect(() => {
        let timer: ReturnType<typeof setInterval> | undefined;
        if (state === 'recording') {
            timer = setInterval(() => {
                setRecordingDuration(prev => {
                    // Auto-stop after 30 seconds
                    if (prev >= 29) {
                        handleStopRecording();
                        return prev + 1;
                    }
                    return prev + 1;
                });
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
            if (state !== 'recording') setRecordingDuration(0);
        };
    }, [state, handleStopRecording]);


    const handleStartRecording = async () => {
        try {
            setError('');
            await startRecording();
            setState('recording');
        } catch {
            setError('Microphone access denied. Please allow mic permissions.');
            setState('error');
        }
    };

    const handleCancel = () => {
        if (state === 'recording') {
            cancelRecording();
        }
        onClose();
    };

    const handleRetry = () => {
        setResult(null);
        setError('');
        setState('idle');
    };

    const handleConfirm = () => {
        const amount = parseFloat(editAmount);
        if (isNaN(amount) || amount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        addTransaction({
            amount,
            category: editCategory,
            description: editDescription || 'Voice Transaction',
            type: editType,
            accountId: selectedAccountId || accounts[0]?.id || '',
            date: new Date().toISOString()
        });

        onClose();
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white border-4 border-ink shadow-neo max-w-md w-full relative overflow-hidden">
                {/* Header */}
                <div className="bg-ink text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Mic className="w-6 h-6" />
                        <h2 className="text-xl font-black uppercase font-display">Voice Input</h2>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Premium Gate */}
                {state === 'premium-gate' && (
                    <div className="p-8 text-center">
                        <div className="w-20 h-20 bg-yellow-100 border-4 border-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mic className="w-10 h-10 text-yellow-600" />
                        </div>
                        <h3 className="text-2xl font-black uppercase font-display mb-2">Premium Feature</h3>
                        <p className="text-gray-500 mb-6">Voice commands are available for Premium users. Upgrade to log expenses by speaking!</p>
                        <Link
                            to="/settings?tab=premium"
                            className="block w-full bg-yellow-400 text-ink border-2 border-ink py-4 font-black uppercase text-center shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                        >
                            Upgrade to Premium
                        </Link>
                    </div>
                )}

                {/* Idle State */}
                {state === 'idle' && (
                    <div className="p-8 text-center">
                        <p className="text-gray-500 mb-6">Tap the mic and speak your transaction</p>
                        <p className="text-sm text-gray-400 italic mb-8">"Spent 450 on groceries" or "Got 5000 from freelance"</p>
                        <button
                            onClick={handleStartRecording}
                            className="w-24 h-24 bg-banky-green border-4 border-ink shadow-neo rounded-full flex items-center justify-center mx-auto hover:-translate-y-1 transition-transform"
                        >
                            <Mic className="w-12 h-12 text-ink" />
                        </button>
                    </div>
                )}

                {/* Recording State */}
                {state === 'recording' && (
                    <div className="p-8 text-center">
                        <p className="text-gray-500 mb-2">Listening...</p>
                        <p className="text-4xl font-mono font-black mb-6">{formatDuration(recordingDuration)}</p>

                        {/* Waveform animation */}
                        <div className="flex items-center justify-center gap-1 mb-8 h-16">
                            {waveformHeights.map((height, i) => (
                                <div
                                    key={i}
                                    className="w-2 bg-banky-pink rounded-full animate-pulse"
                                    style={{
                                        height: `${height}px`,
                                        animationDelay: `${i * 0.1}s`,
                                        animationDuration: '0.5s'
                                    }}
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleStopRecording}
                            className="w-24 h-24 bg-red-500 border-4 border-ink shadow-neo rounded-full flex items-center justify-center mx-auto animate-pulse hover:bg-red-600 transition-colors"
                        >
                            <MicOff className="w-12 h-12 text-white" />
                        </button>
                        <p className="text-sm text-gray-400 mt-4">Tap to stop</p>
                    </div>
                )}

                {/* Processing State */}
                {state === 'processing' && (
                    <div className="p-8 text-center">
                        <Loader2 className="w-16 h-16 text-banky-purple animate-spin mx-auto mb-4" />
                        <p className="text-xl font-black uppercase font-display">Understanding...</p>
                        <p className="text-gray-500 mt-2">Processing your voice</p>
                    </div>
                )}

                {/* Confirming State */}
                {state === 'confirming' && result && (
                    <div className="p-6">
                        {/* Transcription */}
                        {result.transcription && (
                            <div className="bg-gray-100 p-3 mb-4 border-2 border-gray-300 text-sm italic">
                                "{result.transcription}"
                            </div>
                        )}

                        {/* Confidence Badge */}
                        <div className="flex justify-end mb-4">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${result.confidence >= 0.8 ? 'bg-green-100 text-green-700' :
                                result.confidence >= 0.5 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                {Math.round(result.confidence * 100)}% confident
                            </span>
                        </div>

                        {/* Editable Fields */}
                        <div className="space-y-4">
                            {/* Type Toggle */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditType('expense')}
                                    className={`flex-1 py-3 border-2 border-ink font-black uppercase text-sm transition-all ${editType === 'expense' ? 'bg-banky-pink text-white shadow-neo-sm' : 'bg-white text-gray-400'
                                        }`}
                                >
                                    Expense
                                </button>
                                <button
                                    onClick={() => setEditType('income')}
                                    className={`flex-1 py-3 border-2 border-ink font-black uppercase text-sm transition-all ${editType === 'income' ? 'bg-banky-green text-ink shadow-neo-sm' : 'bg-white text-gray-400'
                                        }`}
                                >
                                    Income
                                </button>
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block text-xs font-black uppercase mb-1">Amount</label>
                                <div className="flex items-center">
                                    <span className="text-2xl font-black mr-2">{currency.symbol}</span>
                                    <input
                                        type="number"
                                        value={editAmount}
                                        onChange={(e) => setEditAmount(e.target.value)}
                                        className="flex-1 text-3xl font-black border-b-4 border-ink focus:outline-none bg-transparent"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-black uppercase mb-1">Description</label>
                                <input
                                    type="text"
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className="w-full border-2 border-ink p-3 font-bold focus:outline-none focus:shadow-neo-sm"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-xs font-black uppercase mb-1">Category</label>
                                <select
                                    value={editCategory}
                                    onChange={(e) => setEditCategory(e.target.value as Category)}
                                    className="w-full border-2 border-ink p-3 font-bold bg-white focus:outline-none"
                                >
                                    {Object.values(Category).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Account */}
                            {accounts.length > 1 && (
                                <div>
                                    <label className="block text-xs font-black uppercase mb-1">Wallet</label>
                                    <select
                                        value={selectedAccountId}
                                        onChange={(e) => setSelectedAccountId(e.target.value)}
                                        className="w-full border-2 border-ink p-3 font-bold bg-white focus:outline-none"
                                    >
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleRetry}
                                className="flex-1 py-4 border-2 border-ink font-black uppercase flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                            >
                                <Mic className="w-5 h-5" /> Retry
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="flex-1 py-4 bg-banky-yellow border-2 border-ink font-black uppercase shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2"
                            >
                                <Check className="w-5 h-5" /> Save
                            </button>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {state === 'error' && (
                    <div className="p-8 text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600 font-bold mb-4">{error}</p>
                        <button
                            onClick={handleRetry}
                            className="px-6 py-3 bg-ink text-white border-2 border-ink font-black uppercase shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceInput;
