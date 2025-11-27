
import React from 'react';
import { Link } from 'react-router-dom';
import { X, Star, ArrowRight } from 'lucide-react';
import Mascot from './Mascot';

interface DailyBonusModalProps {
    onClose: () => void;
}

const DailyBonusModal: React.FC<DailyBonusModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/90 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border-4 border-ink shadow-neo-xl max-w-sm w-full relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-banky-yellow/20 to-transparent opacity-50 animate-pulse"></div>

                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full z-20"
                >
                    <X className="w-6 h-6 text-ink" />
                </button>

                <div className="p-8 text-center relative z-10 flex flex-col items-center">
                    <div className="bg-banky-yellow border-2 border-ink px-4 py-1 font-black uppercase tracking-widest text-xs mb-6 rotate-[-2deg] shadow-sm">
                        Daily Streak
                    </div>

                    <div className="mb-6 relative">
                        <div className="absolute inset-0 bg-banky-green rounded-full blur-xl opacity-50 animate-ping"></div>
                        <Mascot className="w-32 h-32 relative z-10 drop-shadow-lg" mood="cool" />
                    </div>

                    <h2 className="text-3xl font-black uppercase font-display mb-2">You're Back!</h2>
                    <p className="text-gray-500 font-bold text-sm mb-6">Consistency is key to wealth. Here's a little something for showing up.</p>

                    <div className="flex items-center justify-center gap-2 bg-ink text-white px-6 py-3 border-2 border-ink shadow-neo mb-8 transform hover:scale-105 transition-transform">
                        <Star className="w-6 h-6 text-banky-yellow fill-current animate-spin-slow" />
                        <span className="text-2xl font-black font-mono">+50 XP</span>
                    </div>

                    <div className="flex flex-col gap-3 w-full">
                        <Link
                            to="/education"
                            onClick={onClose}
                            className="w-full bg-banky-pink border-2 border-ink py-3 font-black uppercase flex items-center justify-center gap-2 shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                        >
                            Go to Learn Tab <ArrowRight className="w-5 h-5" />
                        </Link>
                        <button
                            onClick={onClose}
                            className="w-full bg-white border-2 border-ink py-3 font-bold uppercase hover:bg-gray-50 text-xs tracking-widest"
                        >
                            Just Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyBonusModal;
