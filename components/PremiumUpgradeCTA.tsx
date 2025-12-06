import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Crown, Zap, Star, Mic, ScanText, Landmark, Bot } from 'lucide-react';
import { usePremium } from '../context/usePremium';

interface PremiumUpgradeCTAProps {
    variant?: 'banner' | 'card' | 'inline' | 'minimal' | 'floating';
    context?: 'advisor' | 'reports' | 'education' | 'tracker' | 'general';
    className?: string;
}

/**
 * Reusable Premium Upgrade CTA component
 * Different variants for different UI contexts
 */
export const PremiumUpgradeCTA: React.FC<PremiumUpgradeCTAProps> = ({
    variant = 'card',
    context = 'general',
    className = ''
}) => {
    const { isPremium } = usePremium();

    // Don't show if already premium
    if (isPremium) return null;

    // Context-specific messaging
    const contextMessages: Record<string, { title: string; subtitle: string }> = {
        advisor: {
            title: 'Unlock Premium AI',
            subtitle: 'Get unlimited deep financial analysis'
        },
        reports: {
            title: 'Advanced Reports',
            subtitle: 'Unlock AI-powered insights & export'
        },
        education: {
            title: 'Learn Faster',
            subtitle: 'Premium modules & personalized learning'
        },
        tracker: {
            title: 'Smart Tracking',
            subtitle: 'OCR receipts & voice commands coming soon'
        },
        general: {
            title: 'Go Premium',
            subtitle: 'Unlock all features for ₹149/month'
        }
    };

    const { title, subtitle } = contextMessages[context] || contextMessages.general;

    // Minimal variant - just a small upgrade button
    if (variant === 'minimal') {
        return (
            <Link
                to="/settings?tab=premium"
                className={`inline-flex items-center gap-1 text-xs font-bold text-banky-purple hover:text-banky-pink transition-colors ${className}`}
            >
                <Sparkles className="w-3 h-3" />
                <span>Upgrade</span>
            </Link>
        );
    }

    // Inline variant - fits in text flow
    if (variant === 'inline') {
        return (
            <Link
                to="/settings?tab=premium"
                className={`inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-banky-purple to-banky-pink text-white text-sm font-bold rounded-full hover:opacity-90 transition-opacity ${className}`}
            >
                <Crown className="w-4 h-4" />
                <span>{title}</span>
            </Link>
        );
    }

    // Floating variant - fixed position badge
    if (variant === 'floating') {
        return (
            <Link
                to="/settings?tab=premium"
                className={`fixed bottom-24 md:bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-ink font-black uppercase text-sm rounded-full shadow-neo border-2 border-ink hover:-translate-y-1 transition-transform animate-pulse ${className}`}
            >
                <Zap className="w-5 h-5" />
                <span>Go Pro</span>
            </Link>
        );
    }

    // Banner variant - full width
    if (variant === 'banner') {
        return (
            <div className={`w-full bg-gradient-to-r from-purple-900 via-purple-800 to-pink-800 p-4 ${className}`}>
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-full">
                            <Star className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <p className="font-black text-white uppercase tracking-wide">{title}</p>
                            <p className="text-purple-200 text-sm">{subtitle}</p>
                        </div>
                    </div>
                    <Link
                        to="/settings?tab=premium"
                        className="px-6 py-2 bg-white text-purple-900 font-black uppercase text-sm rounded-full hover:bg-yellow-400 transition-colors flex items-center gap-2"
                    >
                        Upgrade <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        );
    }

    // Card variant (default) - standalone card
    return (
        <div className={`bg-gradient-to-br from-gray-900 to-black p-6 border-4 border-ink shadow-neo relative overflow-hidden ${className}`}>
            <div className="absolute top-0 right-0 bg-yellow-400 text-ink text-xs font-black px-3 py-1 uppercase">
                Premium
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-yellow-400/20 rounded-full border-2 border-yellow-400">
                        <Sparkles className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase font-display">{title}</h3>
                        <p className="text-gray-400 text-sm">{subtitle}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="px-2 py-2 bg-white/10 rounded flex items-center gap-2">
                        <Mic className="w-4 h-4 text-yellow-400" />
                        <span className="text-white text-xs font-bold">Voice</span>
                    </div>
                    <div className="px-2 py-2 bg-white/10 rounded flex items-center gap-2">
                        <ScanText className="w-4 h-4 text-yellow-400" />
                        <span className="text-white text-xs font-bold">OCR</span>
                    </div>
                    <div className="px-2 py-2 bg-white/10 rounded flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-yellow-400" />
                        <span className="text-white text-xs font-bold">Bank Sync</span>
                    </div>
                    <div className="px-2 py-2 bg-white/10 rounded flex items-center gap-2">
                        <Bot className="w-4 h-4 text-yellow-400" />
                        <span className="text-white text-xs font-bold">AI Pro</span>
                    </div>
                </div>

                <Link
                    to="/settings?tab=premium"
                    className="w-full bg-yellow-400 text-ink border-2 border-ink py-3 font-black uppercase text-center block shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                >
                    Upgrade Now - ₹149/mo
                </Link>
            </div>
        </div>
    );
};

export default PremiumUpgradeCTA;
