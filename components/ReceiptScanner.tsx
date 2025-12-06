import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, X, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useBanky } from '../context/useBanky';
import { usePremium } from '../context/usePremium';
import { Link } from 'react-router-dom';
import { parseReceiptImage, ParsedReceipt } from '../services/geminiService';
import { Category } from '../types';

type ScanState = 'idle' | 'preview' | 'processing' | 'confirming' | 'error' | 'premium-gate';

interface ReceiptScannerProps {
    onClose: () => void;
    defaultAccountId?: string;
}

import PermissionModal from './PermissionModal';

const ReceiptScanner: React.FC<ReceiptScannerProps> = ({ onClose, defaultAccountId }) => {
    const { addTransaction, accounts, currency } = useBanky();
    const { isPremium } = usePremium();

    // Compute initial state
    const getInitialState = (): ScanState => {
        if (!isPremium) return 'premium-gate';
        return 'idle';
    };

    const [state, setState] = useState<ScanState>(getInitialState);
    const [result, setResult] = useState<ParsedReceipt | null>(null);
    const [error, setError] = useState<string>('');
    const [imagePreview, setImagePreview] = useState<string>('');
    const [selectedAccountId, setSelectedAccountId] = useState(defaultAccountId || accounts[0]?.id || '');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // Editable fields
    const [editAmount, setEditAmount] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editCategory, setEditCategory] = useState<Category>(Category.OTHER);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            setState('error');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('Image too large. Maximum 10MB allowed.');
            setState('error');
            return;
        }

        try {
            // Create preview
            const reader = new FileReader();
            reader.onload = async (event) => {
                const dataUrl = event.target?.result as string;
                setImagePreview(dataUrl);
                setState('preview');
            };
            reader.readAsDataURL(file);
        } catch {
            setError('Failed to load image');
            setState('error');
        }
    };

    const handleScan = async () => {
        if (!imagePreview) return;

        setState('processing');

        try {
            // Extract base64 and mime type from data URL
            const [header, base64Data] = imagePreview.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';

            const parsed = await parseReceiptImage(base64Data, mimeType);

            if (parsed) {
                setResult(parsed);
                setEditAmount(parsed.amount.toString());
                setEditDescription(parsed.merchant || parsed.description);
                setEditCategory(parsed.category as Category);
                setState('confirming');
            } else {
                setError('Could not read the receipt. Try a clearer image.');
                setState('error');
            }
        } catch {
            setError('Failed to process image. Please try again.');
            setState('error');
        }
    };

    const handleRetry = () => {
        setResult(null);
        setError('');
        setImagePreview('');
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
            description: editDescription || 'Receipt Transaction',
            type: 'expense',
            accountId: selectedAccountId || accounts[0]?.id || '',
            date: new Date().toISOString()
        });

        onClose();
    };


    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white border-4 border-ink shadow-neo max-w-md w-full relative overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-ink text-white px-6 py-4 flex items-center justify-between sticky top-0">
                    <div className="flex items-center gap-3">
                        <Camera className="w-6 h-6" />
                        <h2 className="text-xl font-black uppercase font-display">Scan Receipt</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Premium Gate */}
                {state === 'premium-gate' && (
                    <div className="p-8 text-center">
                        <div className="w-20 h-20 bg-yellow-100 border-4 border-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Camera className="w-10 h-10 text-yellow-600" />
                        </div>
                        <h3 className="text-2xl font-black uppercase font-display mb-2">Premium Feature</h3>
                        <p className="text-gray-500 mb-6">Receipt scanning is available for Premium users. Upgrade to snap photos of your bills!</p>
                        <Link
                            to="/settings?tab=premium"
                            className="block w-full bg-yellow-400 text-ink border-2 border-ink py-4 font-black uppercase text-center shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                        >
                            Upgrade to Premium
                        </Link>
                    </div>
                )}

                {/* Idle State - Choose Input */}
                {state === 'idle' && (
                    <div className="p-8">
                        <p className="text-gray-500 text-center mb-6">Take a photo or choose from gallery</p>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Camera Button */}
                            <button
                                onClick={() => cameraInputRef.current?.click()}
                                className="bg-banky-green border-4 border-ink p-6 shadow-neo flex flex-col items-center gap-3 hover:-translate-y-1 transition-transform"
                            >
                                <Camera className="w-10 h-10 text-ink" />
                                <span className="font-black uppercase text-sm">Camera</span>
                            </button>

                            {/* Upload Button */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-banky-blue border-4 border-ink p-6 shadow-neo flex flex-col items-center gap-3 hover:-translate-y-1 transition-transform"
                            >
                                <Upload className="w-10 h-10 text-ink" />
                                <span className="font-black uppercase text-sm">Gallery</span>
                            </button>
                        </div>

                        {/* Hidden file inputs */}
                        <input
                            ref={cameraInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        <p className="text-xs text-gray-400 text-center mt-6 italic">
                            Supports receipts, bills, invoices in any language
                        </p>
                    </div>
                )}

                {/* Preview State */}
                {state === 'preview' && (
                    <div className="p-6">
                        <div className="border-4 border-ink mb-4 overflow-hidden">
                            <img
                                src={imagePreview}
                                alt="Receipt preview"
                                className="w-full max-h-64 object-contain bg-gray-100"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleRetry}
                                className="flex-1 py-4 border-2 border-ink font-black uppercase flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                            >
                                <Camera className="w-5 h-5" /> Retake
                            </button>
                            <button
                                onClick={handleScan}
                                className="flex-1 py-4 bg-banky-yellow border-2 border-ink font-black uppercase shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2"
                            >
                                <ImageIcon className="w-5 h-5" /> Scan It!
                            </button>
                        </div>
                    </div>
                )}

                {/* Processing State */}
                {state === 'processing' && (
                    <div className="p-8 text-center">
                        <Loader2 className="w-16 h-16 text-banky-purple animate-spin mx-auto mb-4" />
                        <p className="text-xl font-black uppercase font-display">Reading Receipt...</p>
                        <p className="text-gray-500 mt-2">Extracting details with AI</p>
                    </div>
                )}

                {/* Confirming State */}
                {state === 'confirming' && result && (
                    <div className="p-6">
                        {/* Preview thumbnail */}
                        {imagePreview && (
                            <div className="w-20 h-20 border-2 border-gray-300 mb-4 overflow-hidden float-right ml-4">
                                <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                            </div>
                        )}

                        {/* Merchant */}
                        {result.merchant && (
                            <div className="mb-2">
                                <span className="text-xs font-bold text-gray-400 uppercase">Merchant</span>
                                <p className="text-lg font-black">{result.merchant}</p>
                            </div>
                        )}

                        {/* Confidence Badge */}
                        <div className="flex justify-start mb-4 clear-both">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${result.confidence >= 0.8 ? 'bg-green-100 text-green-700' :
                                result.confidence >= 0.5 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                {Math.round(result.confidence * 100)}% confident
                            </span>
                        </div>

                        {/* Editable Fields */}
                        <div className="space-y-4">
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

                            {/* Items breakdown if available */}
                            {result.items && result.items.length > 0 && (
                                <div>
                                    <label className="block text-xs font-black uppercase mb-2">Items Found</label>
                                    <div className="bg-gray-50 border-2 border-gray-200 p-3 max-h-32 overflow-y-auto">
                                        {result.items.map((item, i) => (
                                            <div key={i} className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                                                <span className="text-gray-600">{item.name}</span>
                                                <span className="font-mono font-bold">{currency.symbol}{item.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleRetry}
                                className="flex-1 py-4 border-2 border-ink font-black uppercase flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                            >
                                <Camera className="w-5 h-5" /> Retry
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

export default ReceiptScanner;
