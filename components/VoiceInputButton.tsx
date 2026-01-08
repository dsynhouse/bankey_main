
import React, { useState, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { useBanky } from '../context/useBanky';
import { parseNaturalLanguageTransaction } from '../services/geminiService';
import { logger } from '../utils/logger';

export const VoiceInputButton: React.FC = () => {
    const { addTransaction } = useBanky();
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [, setTranscript] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [recognition, setRecognition] = useState<any>(null);
    const [, setIsSupported] = useState(false);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setIsSupported(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = false;
            recognitionInstance.interimResults = false;
            recognitionInstance.lang = 'en-US';

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognitionInstance.onresult = (event: any) => {
                const text = event.results[0][0].transcript;
                setTranscript(text);
                setIsListening(false);
                handleProcessing(text);
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognitionInstance.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            recognitionInstance.onend = () => {
                setIsListening(false);
            };

            setRecognition(recognitionInstance);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleListening = () => {
        if (!recognition) {
            alert("Voice input not supported in this browser.");
            return;
        }

        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            setTranscript('');
            recognition.start();
            setIsListening(true);
        }
    };

    const handleProcessing = async (text: string) => {
        setIsProcessing(true);
        try {
            const result = await parseNaturalLanguageTransaction(text);
            if (result && result.amount && result.category && result.type) {
                // Determine account ID (default to first available or leave undefined for context to handle)
                // The context addTransaction handles missing accountId by picking default
                await addTransaction({
                    amount: result.amount,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    category: result.category as any,
                    description: result.description || 'Voice Entry',
                    date: result.date || new Date().toISOString(),
                    type: result.type as 'expense' | 'income',
                    accountId: '' // Context will auto-assign
                });

                // Haptic feedback if available
                if (navigator.vibrate) navigator.vibrate(200);
            } else {
                alert(`Couldn't understand: "${text}". Try "Spent 50 on Food"`);
            }
        } catch (error) {
            logger.error('Voice Processing Failed', error);
            alert("Failed to process voice command.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (!recognition) return null;

    return (
        <button
            onClick={toggleListening}
            disabled={isProcessing}
            className={`fixed bottom-24 right-6 z-50 p-4 rounded-full shadow-neo transition-all duration-300 ${isListening ? 'bg-red-500 animate-pulse' : isProcessing ? 'bg-gray-400' : 'bg-banky-blue'
                } border-2 border-ink text-white`}
            aria-label="Voice Command"
        >
            {isProcessing ? (
                <Loader2 className="w-6 h-6 animate-spin" />
            ) : isListening ? (
                <Square className="w-6 h-6 fill-current" />
            ) : (
                <Mic className="w-6 h-6" />
            )}
        </button>
    );
};
