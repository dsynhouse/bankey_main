import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import VoiceInput from './VoiceInput';

interface VoiceInputButtonProps {
    className?: string;
    accountId?: string;
}

/**
 * Floating voice input button (FAB)
 * Opens the voice input modal when clicked
 */
const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({ className = '', accountId }) => {
    const [showVoiceInput, setShowVoiceInput] = useState(false);

    return (
        <>
            <button
                onClick={() => setShowVoiceInput(true)}
                className={`fixed bottom-24 md:bottom-8 right-6 z-40 w-16 h-16 bg-gradient-to-br from-banky-purple to-banky-pink text-white border-4 border-ink shadow-neo rounded-full flex items-center justify-center hover:-translate-y-1 transition-transform group ${className}`}
                title="Voice Input"
            >
                <Mic className="w-7 h-7 group-hover:scale-110 transition-transform" />

                {/* Pulse ring animation */}
                <span className="absolute inset-0 rounded-full border-4 border-banky-purple animate-ping opacity-30" />
            </button>

            {showVoiceInput && (
                <VoiceInput
                    onClose={() => setShowVoiceInput(false)}
                    defaultAccountId={accountId}
                />
            )}
        </>
    );
};

export default VoiceInputButton;
