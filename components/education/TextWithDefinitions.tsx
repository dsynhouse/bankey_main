import React, { useState } from 'react';

interface TextWithDefinitionsProps {
    text: string;
    definitions?: { term: string; definition: string }[];
}

/**
 * TextWithDefinitions component renders text with interactive term definitions.
 * Clicking on defined terms shows a popup with the definition.
 */
const TextWithDefinitions: React.FC<TextWithDefinitionsProps> = ({ text, definitions }) => {
    const [activeTerm, setActiveTerm] = useState<string | null>(null);

    if (!definitions || definitions.length === 0) return <>{text}</>;

    // Create a regex pattern to match terms (case insensitive)
    const pattern = new RegExp(`(${definitions.map(d => d.term).join('|')})`, 'gi');
    const parts = text.split(pattern);

    return (
        <span>
            {parts.map((part, i) => {
                const def = definitions.find(d => d.term.toLowerCase() === part.toLowerCase());
                if (def) {
                    return (
                        <span key={i} className="relative inline-block group">
                            <button
                                onClick={() => setActiveTerm(activeTerm === def.term ? null : def.term)}
                                className="text-banky-blue font-black underline decoration-2 decoration-banky-yellow underline-offset-2 hover:bg-banky-yellow hover:text-ink transition-colors px-1 rounded"
                            >
                                {part}
                            </button>
                            {activeTerm === def.term && (
                                <>
                                    {/* Mobile: Fixed Modal */}
                                    <div
                                        className="md:hidden fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-[1px]"
                                        onClick={(e) => { e.stopPropagation(); setActiveTerm(null); }}
                                    >
                                        <div
                                            className="bg-ink text-white p-6 rounded-lg shadow-neo-xl w-full max-w-xs relative text-center animate-fade-in border-2 border-white"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <p className="font-black text-banky-yellow uppercase mb-2 text-lg">{def.term}</p>
                                            <p className="font-medium leading-relaxed">{def.definition}</p>
                                            <button
                                                onClick={() => setActiveTerm(null)}
                                                className="mt-6 w-full bg-white text-ink font-black uppercase py-2 rounded hover:bg-gray-200"
                                            >
                                                Got it
                                            </button>
                                        </div>
                                    </div>

                                    {/* Desktop: Tooltip */}
                                    <div className="hidden md:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-ink text-white text-xs p-3 rounded shadow-xl z-50 animate-fade-in text-center">
                                        <p className="font-bold mb-1 uppercase text-banky-yellow">{def.term}</p>
                                        <p>{def.definition}</p>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-ink"></div>
                                    </div>
                                </>
                            )}
                        </span>
                    );
                }
                return <span key={i}>{part}</span>;
            })}
        </span>
    );
};

export default TextWithDefinitions;
