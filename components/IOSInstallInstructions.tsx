import React from 'react';
import { Share, PlusSquare, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Mascot from './Mascot';

const IOSInstallInstructions: React.FC = () => {
    return (
        <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-ink selection:bg-banky-pink selection:text-ink font-sans">
            <div className="max-w-md w-full bg-white border-4 border-ink shadow-neo-xl p-8 rounded-3xl relative overflow-hidden">

                {/* Header */}
                <div className="text-center mb-8 relative z-10">
                    <Mascot className="w-20 h-20 mx-auto mb-4" mood="cool" />
                    <h1 className="text-3xl font-black uppercase font-display leading-none mb-2">
                        Get Bankey <br /> <span className="text-banky-blue">on iPhone</span>
                    </h1>
                    <p className="font-bold text-gray-500">3 simple steps to install via Safari</p>
                </div>

                {/* Steps */}
                <div className="space-y-6 relative z-10">
                    {/* Step 1 */}
                    <div className="flex gap-4 items-start">
                        <div className="w-8 h-8 bg-banky-yellow border-2 border-ink rounded-full flex items-center justify-center font-black shrink-0 shadow-neo-sm">1</div>
                        <div>
                            <p className="font-black uppercase text-sm mb-1 font-display">Open in Safari</p>
                            <p className="text-sm font-medium text-gray-600">Ensure you are viewing <b>bankey.club</b> in the Safari browser.</p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4 items-start">
                        <div className="w-8 h-8 bg-banky-pink border-2 border-ink rounded-full flex items-center justify-center font-black shrink-0 shadow-neo-sm text-white">2</div>
                        <div>
                            <p className="font-black uppercase text-sm mb-1 font-display">Tap Share</p>
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                Click the <Share className="w-4 h-4 inline-block mx-1" /> share icon in the bottom menu.
                            </div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4 items-start">
                        <div className="w-8 h-8 bg-banky-green border-2 border-ink rounded-full flex items-center justify-center font-black shrink-0 shadow-neo-sm">3</div>
                        <div>
                            <p className="font-black uppercase text-sm mb-1 font-display">Add to Home Screen</p>
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                Scroll down and tap <span className="inline-flex items-center gap-1 font-bold bg-gray-100 px-2 py-0.5 rounded border border-gray-300"><PlusSquare className="w-3 h-3" /> Add to Home Screen</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer/Back */}
                <div className="mt-10 text-center relative z-10">
                    <Link to="/" className="inline-flex items-center gap-2 font-black uppercase text-sm hover:text-banky-blue transition-colors font-display">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                </div>

                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-banky-yellow/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-banky-blue/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
            </div>
        </div>
    );
};

export default IOSInstallInstructions;
