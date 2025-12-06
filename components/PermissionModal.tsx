import React, { useState } from 'react';
import { Mic, Camera, Lock, Check, X, Settings } from 'lucide-react';

export type PermissionType = 'microphone' | 'camera';

interface PermissionModalProps {
    type: PermissionType;
    isOpen: boolean;
    onClose: () => void;
    onGrant: () => Promise<boolean>;
    onSuccess: () => void;
}

const PermissionModal: React.FC<PermissionModalProps> = ({
    type,
    isOpen,
    onClose,
    onGrant,
    onSuccess
}) => {
    const [status, setStatus] = useState<'idle' | 'requesting' | 'denied'>('idle');

    if (!isOpen) return null;

    const handleAllow = async () => {
        setStatus('requesting');
        try {
            const granted = await onGrant();
            if (granted) {
                onSuccess();
                onClose();
            } else {
                setStatus('denied');
            }
        } catch (error) {
            console.error('Permission request failed:', error);
            setStatus('denied');
        }
    };

    const isMic = type === 'microphone';
    const Icon = isMic ? Mic : Camera;
    const title = isMic ? 'Microphone Access' : 'Camera Access';
    const description = isMic
        ? 'Bankey needs access to your microphone to record voice commands.'
        : 'Bankey needs access to your camera to scan receipts.';

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white border-4 border-ink shadow-neo max-w-sm w-full relative overflow-hidden">
                {/* Header */}
                <div className="bg-ink text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5" />
                        <h2 className="text-lg font-black uppercase font-display">Permission Required</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 text-center">
                    {/* Icon Status */}
                    <div className="mb-6 relative inline-block">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 border-ink shadow-neo transition-colors ${status === 'denied' ? 'bg-red-100' : 'bg-banky-blue'
                            }`}>
                            {status === 'denied' ? (
                                <Settings className="w-10 h-10 text-red-500" />
                            ) : (
                                <Icon className="w-10 h-10 text-ink" />
                            )}
                        </div>
                        {status === 'denied' && (
                            <div className="absolute -bottom-2 -right-2 bg-red-500 text-white rounded-full p-1 border-2 border-ink">
                                <X className="w-4 h-4" />
                            </div>
                        )}
                    </div>

                    <h3 className="text-xl font-black uppercase mb-3">{title}</h3>
                    <p className="text-gray-600 mb-8 min-h-[3rem]">
                        {status === 'denied'
                            ? `Access denied. Please enable ${type} permissions in your device settings.`
                            : description}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        {status === 'denied' ? (
                            <button
                                onClick={onClose}
                                className="py-4 bg-ink text-white border-2 border-ink font-black uppercase shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                            >
                                I Understand
                            </button>
                        ) : (
                            <button
                                onClick={handleAllow}
                                disabled={status === 'requesting'}
                                className="py-4 bg-banky-yellow border-2 border-ink font-black uppercase shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2"
                            >
                                {status === 'requesting' ? 'Requesting...' : 'Allow Access'}
                            </button>
                        )}

                        {status !== 'denied' && (
                            <button
                                onClick={onClose}
                                className="py-3 font-bold text-gray-500 hover:text-ink transition-colors uppercase text-sm"
                            >
                                Not Now
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PermissionModal;
