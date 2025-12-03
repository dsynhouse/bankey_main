
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBanky } from '../context/useBanky';
import { EducationModule, LessonOption, RegionCode, LessonStep, AllocatorCategory } from '../types';
import { BASE_MODULES } from '../data/educationData';
import { getRealTimeLearnContext } from '../services/geminiService';
import { Map as MapIcon, Book, ArrowRight, Lock, RotateCcw, Split, Briefcase, Check, Package, X, Globe, MousePointerClick, ExternalLink, Loader2, ThumbsUp, ThumbsDown, Heart, ArrowLeft, AlertTriangle, BookOpen, Star } from 'lucide-react';
import Mascot from './Mascot';
import confetti from 'canvas-confetti';

// --- 1. DICTIONARY FOR REGIONAL TERMS ---
const LOCALIZATION_MAP: Record<RegionCode, Record<string, string>> = {
    'US': {
        'CURRENCY_SYMBOL': '$',
        'TAX_AGENCY': 'IRS',
        'RETIREMENT_ACC': '401k',
        'TAX_FREE_ACC': 'Roth IRA',
        'CREDIT_SCORE': 'FICO',
        'INDEX_FUND': 'S&P 500',
        'ID_NUM': 'SSN',
        'TAX_SECTION': 'Standard Deduction',
        'CENTRAL_BANK': 'Federal Reserve',
        'ESTATE_LAW': 'Probate'
    },
    'IN': {
        'CURRENCY_SYMBOL': '₹',
        'TAX_AGENCY': 'IT Dept',
        'RETIREMENT_ACC': 'EPF/NPS',
        'TAX_FREE_ACC': 'PPF/ELSS',
        'CREDIT_SCORE': 'CIBIL',
        'INDEX_FUND': 'Nifty 50',
        'ID_NUM': 'PAN/Aadhar',
        'TAX_SECTION': 'Section 80C',
        'CENTRAL_BANK': 'RBI',
        'ESTATE_LAW': 'Succession'
    },
    'Global': {
        'CURRENCY_SYMBOL': '$',
        'TAX_AGENCY': 'Tax Agency',
        'RETIREMENT_ACC': 'Pension Fund',
        'TAX_FREE_ACC': 'Tax-Free Account',
        'CREDIT_SCORE': 'Credit Score',
        'INDEX_FUND': 'Global Index',
        'ID_NUM': 'Tax ID',
        'TAX_SECTION': 'Deductions',
        'CENTRAL_BANK': 'Central Bank',
        'ESTATE_LAW': 'Probate'
    },
    'UK': {
        'CURRENCY_SYMBOL': '£', 'TAX_AGENCY': 'HMRC', 'RETIREMENT_ACC': 'Pension', 'TAX_FREE_ACC': 'ISA', 'CREDIT_SCORE': 'Credit Score', 'INDEX_FUND': 'FTSE 100', 'ID_NUM': 'NI Number', 'TAX_SECTION': 'Personal Allowance', 'CENTRAL_BANK': 'Bank of England', 'ESTATE_LAW': 'Probate'
    },
    'EU': {
        'CURRENCY_SYMBOL': '€', 'TAX_AGENCY': 'Tax Authority', 'RETIREMENT_ACC': 'Pension', 'TAX_FREE_ACC': 'Savings Acc', 'CREDIT_SCORE': 'Credit Score', 'INDEX_FUND': 'Stoxx 50', 'ID_NUM': 'Tax ID', 'TAX_SECTION': 'Deductions', 'CENTRAL_BANK': 'ECB', 'ESTATE_LAW': 'Succession'
    }
};

// --- 2. CONTENT ADAPTER ENGINE ---
const adaptContent = (text: string, region: RegionCode): string => {
    if (!text) return '';
    const map = LOCALIZATION_MAP[region] || LOCALIZATION_MAP['Global'];
    let adapted = text;

    // Replacements
    adapted = adapted.replace(/401k/g, map['RETIREMENT_ACC']);
    adapted = adapted.replace(/Roth IRA/g, map['TAX_FREE_ACC']);
    adapted = adapted.replace(/IRS/g, map['TAX_AGENCY']);
    adapted = adapted.replace(/FICO/g, map['CREDIT_SCORE']);
    adapted = adapted.replace(/S&P 500/g, map['INDEX_FUND']);
    adapted = adapted.replace(/\$/g, map['CURRENCY_SYMBOL']);

    return adapted;
};

// --- 2.5. HELPER: TEXT WITH DEFINITIONS ---
const TextWithDefinitions: React.FC<{ text: string, definitions?: { term: string, definition: string }[] }> = ({ text, definitions }) => {
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
                                    <div className="md:hidden fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-[1px]" onClick={(e) => { e.stopPropagation(); setActiveTerm(null); }}>
                                        <div className="bg-ink text-white p-6 rounded-lg shadow-neo-xl w-full max-w-xs relative text-center animate-fade-in border-2 border-white" onClick={(e) => e.stopPropagation()}>
                                            <p className="font-black text-banky-yellow uppercase mb-2 text-lg">{def.term}</p>
                                            <p className="font-medium leading-relaxed">{def.definition}</p>
                                            <button onClick={() => setActiveTerm(null)} className="mt-6 w-full bg-white text-ink font-black uppercase py-2 rounded hover:bg-gray-200">Got it</button>
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

// --- 3. BASE CURRICULUM ---

// --- 4. HELPER TO GENERATE LOCALIZED MODULES ---
const getLocalizedModules = (region: RegionCode): EducationModule[] => {
    return BASE_MODULES.map(mod => ({
        ...mod,
        title: adaptContent(mod.title, region),
        description: adaptContent(mod.description, region),
        playbook: mod.playbook ? {
            summary: adaptContent(mod.playbook.summary, region),
            realLifeExample: adaptContent(mod.playbook.realLifeExample, region),
            definitions: mod.playbook.definitions.map(d => ({
                term: adaptContent(d.term, region),
                definition: adaptContent(d.definition, region)
            })),
            actionableSteps: mod.playbook.actionableSteps.map(s => adaptContent(s, region))
        } : undefined,
        steps: mod.steps.map(step => ({
            ...step,
            content: adaptContent(step.content, region),
            correctAnswerExplanation: adaptContent(step.correctAnswerExplanation || '', region),
            options: step.options?.map(o => ({ ...o, text: adaptContent(o.text, region), feedback: adaptContent(o.feedback, region) })),
            scenarioOptions: step.scenarioOptions?.map(o => ({ ...o, text: adaptContent(o.text, region), feedback: adaptContent(o.feedback, region) })),
            connectionPairs: step.connectionPairs?.map(p => ({ term: adaptContent(p.term, region), match: adaptContent(p.match, region) })),
            fillBlankCorrect: step.fillBlankCorrect ? adaptContent(step.fillBlankCorrect, region) : undefined,
            fillBlankOptions: step.fillBlankOptions?.map(o => adaptContent(o, region)),
            sortCorrectOrder: step.sortCorrectOrder?.map(o => adaptContent(o, region)),
            allocatorCategories: step.allocatorCategories?.map(c => ({ ...c, label: adaptContent(c.label, region) })),
            selectorTargetPhrases: step.selectorTargetPhrases?.map(p => adaptContent(p, region)),
            // Adapt Binary Choice
            binaryLeft: step.binaryLeft ? { ...step.binaryLeft, label: adaptContent(step.binaryLeft.label, region), feedback: adaptContent(step.binaryLeft.feedback, region) } : undefined,
            binaryRight: step.binaryRight ? { ...step.binaryRight, label: adaptContent(step.binaryRight.label, region), feedback: adaptContent(step.binaryRight.feedback, region) } : undefined,
        }))
    }));
};

const LOOT_TABLE = [
    { id: 'coin_bronze', name: 'Bronze Coin', emoji: '🥉', rarity: 'Common' },
    { id: 'coin_silver', name: 'Silver Coin', emoji: '🥈', rarity: 'Common' },
    { id: 'piggy', name: 'Savings Pig', emoji: '🐷', rarity: 'Common' },
    { id: 'chart', name: 'Stonk Up', emoji: '📈', rarity: 'Uncommon' },
    { id: 'bull', name: 'Bull Market', emoji: '🐂', rarity: 'Uncommon' },
    { id: 'diamond', name: 'Diamond Hands', emoji: '💎', rarity: 'Rare' },
    { id: 'bag', name: 'Secure The Bag', emoji: '💰', rarity: 'Rare' },
    { id: 'rocket', name: 'Moon Shot', emoji: '🚀', rarity: 'Legendary' },
];

const Education: React.FC = () => {
    const { userState, addXp, unlockReward, markUnitComplete, region, setRegion } = useBanky();

    // Generate Localized Content on render
    const modules = React.useMemo(() => getLocalizedModules(region), [region]);

    // View State
    const [viewMode, setViewMode] = useState<'map' | 'lesson'>('map');
    const [showInventory, setShowInventory] = useState(false);
    const [showPlaybook, setShowPlaybook] = useState(false);
    const [showRegionMenu, setShowRegionMenu] = useState(false);
    const [pendingRegion, setPendingRegion] = useState<RegionCode | null>(null);

    // Live Context State
    const [showLiveContext, setShowLiveContext] = useState<string | null>(null);
    const [liveContextData, setLiveContextData] = useState<{ text: string, sources: { title: string, uri: string }[] } | null>(null);
    const [isFetchingContext, setIsFetchingContext] = useState(false);

    // Playbook UI State
    const [playbookModuleId, setPlaybookModuleId] = useState<string | null>(null);
    const [playbookTab, setPlaybookTab] = useState<'summary' | 'real-life' | 'dictionary' | 'actions'>('summary');

    const [activeModule, setActiveModule] = useState<EducationModule | null>(null);

    // Lesson State
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [hearts, setHearts] = useState(3);
    const [combo, setCombo] = useState(0);
    const [lessonFeedback, setLessonFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
    const [lessonStatus, setLessonStatus] = useState<'idle' | 'correct' | 'wrong' | 'mercy'>('idle');

    // Game Specific States
    const [puzzleInput, setPuzzleInput] = useState('');
    const [puzzleShake, setPuzzleShake] = useState(false);
    const [wrongAttempts, setWrongAttempts] = useState(0);

    const [sortCurrentOrder, setSortCurrentOrder] = useState<string[]>([]);
    const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
    const [matchedConnections, setMatchedConnections] = useState<string[]>([]);

    // -- NEW STATES FOR GAMES --
    const [allocatorValues, setAllocatorValues] = useState<{ label: string, value: number }[]>([]);
    const [selectedWords, setSelectedWords] = useState<string[]>([]);
    const [shuffledConnectionItems, setShuffledConnectionItems] = useState<string[]>([]);

    // Victory State
    const [showVictory, setShowVictory] = useState(false);
    const [earnedLoot, setEarnedLoot] = useState<typeof LOOT_TABLE[0] | null>(null);

    // Auto-select first playbook module
    useEffect(() => {
        if (showPlaybook && !playbookModuleId && modules.length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPlaybookModuleId(modules[0].id);
        }
    }, [showPlaybook, modules, playbookModuleId]);

    const resetStepState = React.useCallback(() => {
        setLessonStatus('idle');
        setLessonFeedback(null);
        setPuzzleInput('');
        setSortCurrentOrder([]);
        setWrongAttempts(0);
        setSelectedConnection(null);
        setMatchedConnections([]);
        setAllocatorValues([]);
        setSelectedWords([]);

        // Initialize Allocator if needed
        const step = activeModule?.steps[currentStepIndex + 1] || activeModule?.steps[0];
        if (step?.type === 'slider-allocator' && step.allocatorCategories) {
            setAllocatorValues(step.allocatorCategories.map(c => ({ label: c.label, value: c.startPercent })));
        }
    }, [activeModule, currentStepIndex]);

    const finishModule = React.useCallback(() => {
        if (!activeModule) return;
        markUnitComplete(activeModule.id);
        addXp(activeModule.xpReward);
        const randomLoot = LOOT_TABLE[Math.floor(Math.random() * LOOT_TABLE.length)];
        setEarnedLoot(randomLoot);
        unlockReward(randomLoot.id);
        setShowVictory(true);
        setViewMode('map');
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#D4FF00', '#FF90E8', '#00FFA3'] });
    }, [activeModule, markUnitComplete, addXp, unlockReward]);

    // --- Effect: Shuffle Connections ---
    useEffect(() => {
        if (activeModule && viewMode === 'lesson') {
            const currentStep = activeModule.steps[currentStepIndex];
            if (currentStep && currentStep.type === 'connections' && currentStep.connectionPairs) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setShuffledConnectionItems(
                    [...currentStep.connectionPairs.map(p => p.term), ...currentStep.connectionPairs.map(p => p.match)]
                        .sort(() => Math.random() - 0.5)
                );
            }
        }
    }, [activeModule, viewMode, currentStepIndex]);

    // --- Effect: Handle Auto-Advance ---
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (lessonStatus === 'correct' && activeModule) {
            timer = setTimeout(() => {
                if (currentStepIndex < activeModule.steps.length - 1) {
                    setCurrentStepIndex(prev => prev + 1);
                    resetStepState();
                } else {
                    finishModule();
                }
            }, 2500);
        }
        return () => clearTimeout(timer);
    }, [lessonStatus, currentStepIndex, activeModule, finishModule, resetStepState]);



    // Initialize Allocator for first step if needed
    useEffect(() => {
        if (activeModule && viewMode === 'lesson') {
            const step = activeModule.steps[currentStepIndex];
            if (step.type === 'slider-allocator' && step.allocatorCategories && allocatorValues.length === 0) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setAllocatorValues(step.allocatorCategories.map(c => ({ label: c.label, value: c.startPercent })));
            }
        }
    }, [activeModule, viewMode, currentStepIndex, allocatorValues.length]);


    // --- Handlers ---

    const handleRegionChange = (newRegion: RegionCode) => {
        setPendingRegion(newRegion);
    };

    const confirmRegionChange = () => {
        if (pendingRegion) {
            setRegion(pendingRegion);
            setPendingRegion(null);
            setShowRegionMenu(false);
            setPlaybookModuleId(null);
        }
    };

    const handleStartModule = (module: EducationModule) => {
        setActiveModule(module);
        setViewMode('lesson');
        setCurrentStepIndex(0);
        setHearts(3);
        setCombo(0);
        resetStepState();
    };

    const handleLiveContext = async (moduleId: string, topic: string) => {
        setShowLiveContext(moduleId);
        setLiveContextData(null);
        setIsFetchingContext(true);

        const result = await getRealTimeLearnContext(topic);
        if (result) {
            setLiveContextData({ text: result.text || '', sources: result.sources || [] });
        } else {
            setLiveContextData({ text: "Could not fetch live data right now.", sources: [] });
        }
        setIsFetchingContext(false);
    };

    const handleAnswer = (option: LessonOption) => processResult(option.isCorrect, option.feedback);
    const handleScenarioAnswer = (isCorrect: boolean, feedback: string) => processResult(isCorrect, feedback);

    // NEW: Binary Choice Handler
    const handleBinaryChoice = (isCorrect: boolean, feedback: string) => {
        if (lessonStatus !== 'idle') return;
        processResult(isCorrect, feedback);
    };

    // NEW: Card Swipe Handler
    const handleCardSwipe = (direction: 'left' | 'right', step: LessonStep) => {
        if (lessonStatus !== 'idle') return;
        const choice = direction === 'left' ? step.binaryLeft : step.binaryRight;
        if (choice) {
            processResult(choice.isCorrect, choice.feedback);
        }
    };

    const processResult = (isCorrect: boolean, feedback: string) => {
        const currentStep = activeModule?.steps[currentStepIndex];
        const explanation = currentStep?.correctAnswerExplanation ? ` ${currentStep.correctAnswerExplanation}` : '';

        if (isCorrect) {
            setLessonFeedback({ isCorrect: true, text: feedback + explanation });
            setCombo(prev => prev + 1);
            setLessonStatus('correct');
        } else {
            const newWrong = wrongAttempts + 1;
            setWrongAttempts(newWrong);
            if (newWrong >= 3 && currentStep) {
                triggerMercyRule(currentStep);
            } else {
                setLessonFeedback({ isCorrect: false, text: feedback });
                setHearts(prev => prev - 1);
                setCombo(0);
                setLessonStatus('wrong');
            }
        }
    };

    const triggerMercyRule = (currentStep: LessonStep) => {
        setLessonStatus('mercy');
        let answerText = "The correct answer is shown above.";

        if (currentStep.type === 'puzzle') answerText = `The word was: ${currentStep.puzzleWord}`;
        else if (currentStep.type === 'fill-blank') answerText = `The answer is: ${currentStep.fillBlankCorrect}`;
        else if (currentStep.type === 'sorting') answerText = `Correct order: ${currentStep.sortCorrectOrder?.join(' → ')}`;
        else if (currentStep.type === 'question') {
            const correctOpt = currentStep.options?.find(o => o.isCorrect);
            answerText = `Correct answer: ${correctOpt?.text}`;
        } else if (currentStep.type === 'scenario') {
            const correctOpt = currentStep.scenarioOptions?.find(o => o.isCorrect);
            answerText = `Best choice: ${correctOpt?.text}`;
        } else if (currentStep.type === 'slider-allocator') {
            answerText = `Target: ${currentStep.allocatorCategories?.map(c => `${c.label}: ${c.targetPercent}%`).join(', ')}`;
            setAllocatorValues(currentStep.allocatorCategories?.map(c => ({ label: c.label, value: c.targetPercent })) || []);
        } else if (currentStep.type === 'text-selector') {
            answerText = "Look for the red highlighted words.";
        } else if (currentStep.type === 'binary-choice' || currentStep.type === 'card-swipe') {
            answerText = currentStep.binaryLeft?.isCorrect ? currentStep.binaryLeft.label : currentStep.binaryRight?.label || '';
        }

        const explanation = currentStep.correctAnswerExplanation ? `\n\n${currentStep.correctAnswerExplanation}` : '';
        setLessonFeedback({ isCorrect: false, text: answerText + explanation });
    };

    const handlePuzzleSubmit = (e: React.FormEvent, correctWord: string) => {
        e.preventDefault();
        if (lessonStatus !== 'idle') return;
        if (puzzleInput.trim().toUpperCase() === correctWord.toUpperCase()) processResult(true, "Access Granted.");
        else {
            setPuzzleShake(true);
            setTimeout(() => setPuzzleShake(false), 500);
            processResult(false, "Incorrect Code.");
        }
    };

    const handleFillBlank = (option: string, correct: string) => {
        if (lessonStatus !== 'idle') return;
        if (option === correct) processResult(true, "Perfect match.");
        else processResult(false, "Incorrect term.");
    };

    const handleSortClick = (item: string, correctOrder: string[]) => {
        if (lessonStatus !== 'idle' || sortCurrentOrder.includes(item)) return;
        const newOrder = [...sortCurrentOrder, item];
        setSortCurrentOrder(newOrder);

        const currentIndex = newOrder.length - 1;
        if (newOrder[currentIndex] !== correctOrder[currentIndex]) {
            processResult(false, "Wrong order! Resetting.");
            setTimeout(() => {
                setSortCurrentOrder([]);
                setLessonStatus('idle');
                setLessonFeedback(null);
            }, 1000);
        } else if (newOrder.length === correctOrder.length) {
            processResult(true, "Sequence Verified.");
        }
    };

    const handleConnectionClick = (item: string, pairs: { term: string, match: string }[]) => {
        if (lessonStatus !== 'idle' || matchedConnections.includes(item)) return;

        if (!selectedConnection) {
            setSelectedConnection(item);
        } else {
            const isMatch = pairs.some(p =>
                (p.term === selectedConnection && p.match === item) ||
                (p.match === selectedConnection && p.term === item)
            );

            if (isMatch) {
                const newMatches = [...matchedConnections, selectedConnection, item];
                setMatchedConnections(newMatches);
                setSelectedConnection(null);
                if (newMatches.length === pairs.length * 2) {
                    processResult(true, "All Systems Connected.");
                }
            } else {
                setLessonFeedback({ isCorrect: false, text: "Mis-match detected." });
                setHearts(prev => prev - 1);
                setSelectedConnection(null);
                setTimeout(() => setLessonFeedback(null), 1000);
            }
        }
    };

    const handleAllocatorChange = (label: string, newValue: number) => {
        if (lessonStatus !== 'idle') return;
        setAllocatorValues(prev => prev.map(p => p.label === label ? { ...p, value: newValue } : p));
    };

    const checkAllocator = (targets: AllocatorCategory[]) => {
        const isCorrect = targets.every(t => {
            const current = allocatorValues.find(v => v.label === t.label);
            return current && Math.abs(current.value - t.targetPercent) < 5; // Allow 5% margin
        });

        if (isCorrect) processResult(true, "Perfectly Balanced.");
        else processResult(false, "Ratios are off. Try again.");
    };

    const handleSelectorClick = (word: string, targetPhrases: string[]) => {
        if (lessonStatus !== 'idle') return;

        // Clean word
        const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
        if (selectedWords.includes(cleanWord)) return;

        const isTarget = targetPhrases.some(phrase => phrase.toLowerCase().includes(cleanWord.toLowerCase()) || cleanWord.toLowerCase().includes(phrase.toLowerCase()));

        if (isTarget) {
            const newSelected = [...selectedWords, cleanWord];
            setSelectedWords(newSelected);

            // Check if all targets found (simplified check: assumes 1 word per target or close enough)
            if (newSelected.length >= targetPhrases.length) {
                processResult(true, "Threats Identified.");
            }
        } else {
            processResult(false, "That word is safe.");
        }
    };

    const handleNextInfo = () => setLessonStatus('correct');

    const handleMercyNext = () => {
        // Advance without points
        if (activeModule && currentStepIndex < activeModule.steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
            resetStepState();
        } else {
            finishModule();
        }
    }

    const handleRetryStep = () => { setLessonFeedback(null); setLessonStatus('idle'); };



    const closeVictory = () => { setShowVictory(false); setActiveModule(null); setLessonStatus('idle'); };

    // --- RENDERERS ---

    if (viewMode === 'lesson' && activeModule) {
        const currentStep = activeModule.steps[currentStepIndex];
        const progress = ((currentStepIndex) / activeModule.steps.length) * 100;

        if (hearts <= 0) {
            return (
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-fade-in">
                    <Mascot mood="shocked" className="w-32 h-32 mb-6" />
                    <h2 className="text-4xl font-black uppercase font-display mb-2">Mission Failed!</h2>
                    <p className="font-bold text-gray-500 mb-8">You ran out of hearts. Study up and try again.</p>
                    <button onClick={() => handleStartModule(activeModule)} className="bg-banky-yellow border-2 border-ink px-8 py-4 font-black uppercase shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">Try Again</button>
                    <button onClick={() => setViewMode('map')} className="mt-4 font-bold text-gray-400 hover:text-ink">Quit</button>
                </div>
            );
        }

        return (
            <div className="max-w-2xl mx-auto pb-20 relative">
                <div className="flex items-center justify-between mb-8 sticky top-0 bg-paper z-20 py-4 border-b-2 border-transparent">
                    <button onClick={() => setViewMode('map')}><X className="w-6 h-6" /></button>
                    <div className="flex-1 mx-4">
                        <div className="h-4 bg-gray-200 rounded-full border-2 border-ink overflow-hidden">
                            <div className="h-full bg-banky-green transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Heart className="w-6 h-6 fill-red-500 text-red-500 animate-pulse" />
                        <span className="font-black text-xl">{hearts}</span>
                    </div>
                </div>

                {combo > 1 && (
                    <div className="absolute top-16 right-0 animate-bounce-slow">
                        <div className="bg-banky-orange text-white px-3 py-1 font-black uppercase border-2 border-ink rotate-12 shadow-neo-sm">Combo x{combo}!</div>
                    </div>
                )}

                <div className="bg-white border-2 border-ink shadow-neo p-8 min-h-[400px] flex flex-col justify-center relative overflow-hidden">
                    <div className="relative z-10">
                        <span className={`px-2 py-1 text-xs font-black uppercase mb-4 inline-block tracking-widest bg-ink text-white`}>
                            {currentStep.type === 'connections' ? 'Link Data' : currentStep.type === 'slider-allocator' ? 'Budget Balance' : currentStep.type === 'text-selector' ? 'Red Flag Hunter' : currentStep.type === 'binary-choice' ? 'Rapid Fire' : currentStep.type === 'card-swipe' ? 'Swipe Decision' : currentStep.type}
                        </span>

                        {currentStep.type !== 'fill-blank' && currentStep.type !== 'text-selector' && currentStep.type !== 'card-swipe' && (
                            <h2 className="text-2xl md:text-3xl font-black mb-8 font-display leading-tight">
                                <TextWithDefinitions text={currentStep.content} definitions={activeModule.playbook?.definitions} />
                            </h2>
                        )}

                        {currentStep.type === 'text-selector' && (
                            <h2 className="text-xl font-bold mb-4 font-display text-gray-500 uppercase">{currentStep.content}</h2>
                        )}

                        {currentStep.type === 'info' && (
                            <button onClick={handleNextInfo} className="w-full bg-banky-yellow border-2 border-ink py-4 font-black uppercase shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2">
                                Got it <ArrowLeft className="w-5 h-5 rotate-180" />
                            </button>
                        )}

                        {currentStep.type === 'question' && (
                            <div className="space-y-3">
                                {currentStep.options?.map((opt) => {
                                    let stateStyles = 'bg-white hover:bg-gray-50';
                                    if (lessonFeedback) {
                                        if (opt.isCorrect && lessonFeedback.isCorrect) {
                                            if (opt.text === currentStep.options?.find(o => o.isCorrect)?.text) stateStyles = 'bg-banky-green border-banky-green';
                                        } else if (!opt.isCorrect && !lessonFeedback.isCorrect && lessonFeedback.text === opt.feedback) {
                                            stateStyles = 'bg-red-100 border-red-500 opacity-50';
                                        }
                                    }
                                    return (
                                        <button key={opt.id} onClick={() => handleAnswer(opt)} disabled={lessonStatus !== 'idle'} className={`w-full border-2 border-ink p-4 text-left font-bold transition-all relative ${stateStyles} ${lessonStatus === 'idle' && 'hover:-translate-y-1 hover:shadow-neo-sm'}`}>
                                            {opt.text}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* NEW: BINARY CHOICE RENDER */}
                        {currentStep.type === 'binary-choice' && currentStep.binaryLeft && currentStep.binaryRight && (
                            <div className="grid grid-cols-2 gap-4 animate-fade-in">
                                <button
                                    onClick={() => handleBinaryChoice(currentStep.binaryLeft!.isCorrect, currentStep.binaryLeft!.feedback)}
                                    disabled={lessonStatus !== 'idle'}
                                    className="bg-banky-blue text-white border-4 border-ink rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:scale-105 transition-transform shadow-neo"
                                >
                                    <ThumbsUp className="w-12 h-12" />
                                    <span className="font-black text-xl uppercase font-display">{currentStep.binaryLeft.label}</span>
                                </button>
                                <button
                                    onClick={() => handleBinaryChoice(currentStep.binaryRight!.isCorrect, currentStep.binaryRight!.feedback)}
                                    disabled={lessonStatus !== 'idle'}
                                    className="bg-banky-pink text-white border-4 border-ink rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:scale-105 transition-transform shadow-neo"
                                >
                                    <ThumbsDown className="w-12 h-12" />
                                    <span className="font-black text-xl uppercase font-display">{currentStep.binaryRight.label}</span>
                                </button>
                            </div>
                        )}

                        {/* NEW: CARD SWIPE RENDER */}
                        {currentStep.type === 'card-swipe' && currentStep.binaryLeft && currentStep.binaryRight && (
                            <div className="flex flex-col items-center justify-center h-80 relative animate-fade-in">
                                <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none opacity-20">
                                    <span className="font-black uppercase text-xl -rotate-90">{currentStep.binaryLeft.label}</span>
                                    <span className="font-black uppercase text-xl rotate-90">{currentStep.binaryRight.label}</span>
                                </div>

                                <div className="w-64 h-64 bg-white border-4 border-ink rounded-2xl shadow-neo-xl flex flex-col items-center justify-center p-6 text-center relative z-10 transition-transform hover:scale-105">
                                    <h3 className="text-2xl font-black uppercase font-display mb-4">{currentStep.content}</h3>
                                    <div className="flex gap-4 mt-8 w-full">
                                        <button
                                            onClick={() => handleCardSwipe('left', currentStep)}
                                            disabled={lessonStatus !== 'idle'}
                                            className="flex-1 bg-red-100 border-2 border-ink p-2 rounded hover:bg-red-200 font-bold text-xs uppercase"
                                        >
                                            👈 {currentStep.binaryLeft.label}
                                        </button>
                                        <button
                                            onClick={() => handleCardSwipe('right', currentStep)}
                                            disabled={lessonStatus !== 'idle'}
                                            className="flex-1 bg-green-100 border-2 border-ink p-2 rounded hover:bg-green-200 font-bold text-xs uppercase"
                                        >
                                            {currentStep.binaryRight.label} 👉
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SLIDER ALLOCATOR RENDER */}
                        {currentStep.type === 'slider-allocator' && currentStep.allocatorCategories && (
                            <div className="space-y-6 animate-fade-in">
                                {currentStep.allocatorCategories.map((cat, idx) => {
                                    const currentVal = allocatorValues.find(v => v.label === cat.label)?.value || 0;
                                    return (
                                        <div key={idx}>
                                            <div className="flex justify-between font-black uppercase text-sm mb-2">
                                                <span>{cat.label}</span>
                                                <span className="text-banky-blue">{currentVal}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="5"
                                                disabled={lessonStatus !== 'idle'}
                                                value={currentVal}
                                                onChange={(e) => handleAllocatorChange(cat.label, parseInt(e.target.value))}
                                                className="w-full h-4 bg-gray-200 rounded-full appearance-none cursor-pointer accent-ink border-2 border-ink"
                                            />
                                        </div>
                                    )
                                })}
                                <button
                                    onClick={() => checkAllocator(currentStep.allocatorCategories!)}
                                    disabled={lessonStatus !== 'idle'}
                                    className="w-full mt-4 bg-banky-yellow border-2 border-ink py-4 font-black uppercase shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                                >
                                    Check Balance
                                </button>
                            </div>
                        )}

                        {/* TEXT SELECTOR RENDER */}
                        {currentStep.type === 'text-selector' && currentStep.content && (
                            <div className="bg-gray-100 border-2 border-ink p-6 rounded-lg font-mono text-lg leading-loose animate-fade-in shadow-inner">
                                <div className="flex flex-wrap gap-2">
                                    {currentStep.type === 'text-selector' && (
                                        (currentStep.id === '27-2'
                                            ? "URGENT : Your account is suspended . Click here to verify password ."
                                            : currentStep.id === '27-3'
                                                ? "Earn $500 daily with No Experience . We send you a check for equipment ."
                                                : currentStep.id === '29-2'
                                                    ? "Loan Agreement : 400% APR . Failure to pay results in wage garnishment and access to contacts ."
                                                    : currentStep.content
                                        ).split(' ').map((word, idx) => {
                                            const cleanWord = word.replace(/[^a-zA-Z0-9%]/g, ''); // allow % for APR
                                            const isSelected = selectedWords.includes(cleanWord);
                                            const isTarget = currentStep.selectorTargetPhrases?.some(p => p.toLowerCase().includes(cleanWord.toLowerCase()));

                                            let style = "bg-white border-2 border-transparent hover:border-ink cursor-pointer px-1 rounded";

                                            if (isSelected) {
                                                style = isTarget ? "bg-red-500 text-white border-red-700 animate-pulse" : "bg-gray-300 text-gray-500 line-through";
                                            }

                                            return (
                                                <span
                                                    key={idx}
                                                    onClick={() => handleSelectorClick(cleanWord, currentStep.selectorTargetPhrases || [])}
                                                    className={style}
                                                >
                                                    {word}
                                                </span>
                                            )
                                        })
                                    )}
                                </div>
                                <div className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <MousePointerClick className="w-4 h-4" /> Tap suspicious words
                                </div>
                            </div>
                        )}

                        {currentStep.type === 'connections' && currentStep.connectionPairs && (
                            <div className="grid grid-cols-2 gap-4 animate-fade-in">
                                {shuffledConnectionItems
                                    .map((item, idx) => {
                                        const isMatched = matchedConnections.includes(item);
                                        const isSelected = selectedConnection === item;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleConnectionClick(item, currentStep.connectionPairs!)}
                                                disabled={isMatched || lessonStatus !== 'idle'}
                                                className={`p-4 border-2 border-ink font-bold text-sm shadow-sm transition-all ${isMatched ? 'bg-banky-green opacity-50 scale-95' :
                                                    isSelected ? 'bg-banky-yellow -translate-y-1 shadow-neo-sm' :
                                                        'bg-white hover:bg-gray-50'
                                                    }`}
                                            >
                                                {item}
                                            </button>
                                        )
                                    })
                                }
                            </div>
                        )}

                        {currentStep.type === 'scenario' && (
                            <div className="grid grid-cols-1 gap-4">
                                {currentStep.scenarioOptions?.map((opt, idx) => (
                                    <button key={idx} onClick={() => handleScenarioAnswer(opt.isCorrect, opt.feedback)} disabled={lessonStatus !== 'idle'} className={`border-2 border-ink p-6 text-left hover:shadow-neo transition-all bg-white`}>
                                        <p className="font-black text-lg mb-1 uppercase font-display">{opt.text}</p>
                                    </button>
                                ))}
                            </div>
                        )}

                        {currentStep.type === 'puzzle' && currentStep.puzzleWord && (
                            <form onSubmit={(e) => handlePuzzleSubmit(e, currentStep.puzzleWord!)} className="animate-fade-in">
                                <div className="bg-ink p-6 rounded-lg mb-6 text-center relative border-4 border-gray-500">
                                    <p className="text-4xl md:text-6xl font-black text-white tracking-[0.5em] font-mono break-all">{currentStep.scramble}</p>
                                </div>
                                <input autoFocus type="text" value={puzzleInput} onChange={(e) => setPuzzleInput(e.target.value)} className={`w-full border-4 border-ink p-4 font-black text-xl uppercase bg-ink text-white ${puzzleShake ? 'border-red-500' : ''}`} placeholder="TYPE ANSWER..." disabled={lessonStatus === 'correct' || lessonStatus === 'mercy'} />
                                <button type="submit" disabled={!puzzleInput || lessonStatus === 'mercy'} className="w-full bg-banky-purple text-white border-2 border-ink py-4 font-black uppercase mt-4">Unlock</button>
                            </form>
                        )}

                        {currentStep.type === 'fill-blank' && (
                            <div className="animate-fade-in">
                                <div className="bg-gray-100 border-2 border-ink p-6 mb-6 rounded-lg text-2xl font-black leading-relaxed font-display">
                                    {currentStep.content.split('[BLANK]').map((part, i) => (
                                        <React.Fragment key={i}>{part}{i < currentStep.content.split('[BLANK]').length - 1 && (<span className="inline-block border-b-4 border-banky-blue min-w-[100px] text-center text-banky-blue mx-2">{lessonStatus === 'correct' || lessonStatus === 'mercy' ? currentStep.fillBlankCorrect : '_____'}</span>)}</React.Fragment>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {currentStep.fillBlankOptions?.map((opt) => (
                                        <button key={opt} onClick={() => handleFillBlank(opt, currentStep.fillBlankCorrect || '')} disabled={lessonStatus !== 'idle'} className="py-4 border-2 border-ink font-bold uppercase bg-white hover:shadow-neo-sm transition-all">{opt}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {currentStep.type === 'sorting' && (
                            <div className="animate-fade-in">
                                <div className="space-y-2 mb-6 min-h-[150px]">
                                    {sortCurrentOrder.map((item, idx) => (
                                        <div key={item} className="bg-banky-blue text-white border-2 border-ink p-3 font-bold flex items-center gap-3 shadow-neo-sm"><span className="w-6 h-6 bg-white text-ink rounded-full flex items-center justify-center text-xs font-black">{idx + 1}</span>{item}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {currentStep.sortCorrectOrder?.filter(i => !sortCurrentOrder.includes(i)).sort().map((item) => (
                                        <button key={item} onClick={() => handleSortClick(item, currentStep.sortCorrectOrder || [])} disabled={lessonStatus === 'correct' || lessonStatus === 'mercy'} className="p-3 bg-white border-2 border-ink font-bold text-left hover:bg-gray-50 transition-all">{item}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {lessonFeedback && (
                        <div className={`mt-6 p-4 border-2 border-ink font-bold animate-fade-in-up ${lessonStatus === 'mercy' ? 'bg-blue-100 text-blue-900' : lessonFeedback.isCorrect ? 'bg-banky-green text-ink' : 'bg-red-100 text-red-800'}`}>
                            {lessonStatus === 'mercy' && <p className="font-black uppercase text-xs mb-2 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Too Many Attempts</p>}
                            <p className="whitespace-pre-wrap">{lessonFeedback.text}</p>
                            {!lessonFeedback.isCorrect && lessonStatus !== 'mercy' && <button onClick={handleRetryStep} className="mt-2 text-xs uppercase underline font-black hover:text-red-950 flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Try Again</button>}
                            {lessonStatus === 'mercy' && (
                                <button
                                    onClick={handleMercyNext}
                                    className="mt-4 w-full bg-blue-600 text-white border-2 border-blue-800 py-2 font-black uppercase hover:bg-blue-700 flex items-center justify-center gap-2"
                                >
                                    Move On <ArrowRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Calculate Map Height based on modules for Responsive SVG
    const mapHeight = modules.length * 160 + 200;

    return (
        <div className="max-w-5xl mx-auto min-h-screen font-sans">

            {/* REGION SWITCH WARNING MODAL */}
            {pendingRegion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white border-4 border-ink shadow-neo-xl max-w-sm w-full p-6 text-center">
                        <AlertTriangle className="w-12 h-12 text-banky-yellow mx-auto mb-4" />
                        <h3 className="text-2xl font-black uppercase font-display mb-2">Switch Region?</h3>
                        <p className="font-bold text-gray-500 mb-6">
                            You are switching from <span className="text-ink">{region}</span> to <span className="text-ink">{pendingRegion}</span>.
                            Your progress in {region} will be saved, but you will start fresh on the {pendingRegion} map.
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => setPendingRegion(null)} className="flex-1 border-2 border-ink py-3 font-black uppercase hover:bg-gray-100">Cancel</button>
                            <button onClick={confirmRegionChange} className="flex-1 bg-banky-yellow border-2 border-ink py-3 font-black uppercase shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* LIVE CONTEXT MODAL */}
            {showLiveContext && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/90 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white border-4 border-ink shadow-neo-xl w-full max-w-md p-6 relative">
                        <button onClick={() => setShowLiveContext(null)} className="absolute top-2 right-2 p-2 hover:bg-gray-100"><X className="w-5 h-5" /></button>

                        <div className="flex items-center gap-2 mb-4 text-banky-blue">
                            <Globe className="w-6 h-6 animate-pulse" />
                            <h3 className="text-xl font-black uppercase font-display">Live Intel</h3>
                        </div>

                        {isFetchingContext ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-ink mb-2" />
                                <p className="font-bold text-gray-400 uppercase text-xs tracking-widest">Scanning Real World...</p>
                            </div>
                        ) : (
                            <div>
                                <p className="font-medium text-lg leading-relaxed mb-6">{liveContextData?.text}</p>

                                {liveContextData?.sources && liveContextData.sources.length > 0 && (
                                    <div className="border-t-2 border-gray-100 pt-4">
                                        <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Sources</p>
                                        <div className="flex flex-wrap gap-2">
                                            {liveContextData.sources.map((src, i) => (
                                                <a
                                                    key={i}
                                                    href={src.uri}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs bg-gray-100 hover:bg-banky-blue hover:text-white text-ink px-2 py-1 rounded border border-gray-300 hover:border-ink transition-colors flex items-center gap-1 font-bold"
                                                >
                                                    {src.title} <ExternalLink className="w-3 h-3" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-center bg-white border-2 border-ink p-4 shadow-neo sticky top-0 z-40 gap-4">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="bg-banky-yellow p-2 border-2 border-ink"><MapIcon className="w-5 h-5" /></div>
                    <div><h1 className="font-black uppercase font-display leading-none">Campaign</h1><p className="text-xs font-bold text-gray-500">Level {userState.level} • {modules.length} Units</p></div>
                </div>

                {/* Right Side: Unified Actions */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end bg-white">
                    <div className="relative">
                        <button onClick={() => setShowRegionMenu(!showRegionMenu)} className="flex items-center gap-2 bg-ink text-white px-4 py-2 border-2 border-ink font-black uppercase text-xs tracking-wider hover:bg-gray-800 shadow-sm">
                            <Globe className="w-4 h-4" /> {region === 'IN' ? 'India' : region === 'US' ? 'USA' : 'Global'}
                        </button>
                        {showRegionMenu && (
                            <div className="absolute top-full right-0 mt-2 bg-white border-2 border-ink shadow-neo w-40 z-50 flex flex-col">
                                {['US', 'IN', 'Global'].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => handleRegionChange(r as RegionCode)}
                                        className="p-3 text-left font-bold hover:bg-banky-yellow border-b-2 border-ink last:border-0"
                                    >
                                        {r === 'IN' ? '🇮🇳 India' : r === 'US' ? '🇺🇸 USA' : '🌍 Global'}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <Link to="/knowledge-bank" className="flex items-center gap-2 px-4 py-2 bg-banky-green text-ink border-2 border-ink font-black uppercase shadow-sm hover:shadow-neo-sm transition-all text-xs md:text-sm"><BookOpen className="w-4 h-4" /> Knowledge Bank</Link>
                    <button onClick={() => setShowPlaybook(true)} className="flex items-center gap-2 px-4 py-2 bg-banky-blue text-white border-2 border-ink font-black uppercase shadow-sm hover:shadow-neo-sm transition-all text-xs md:text-sm"><Book className="w-4 h-4" /> Playbook</button>
                    <button onClick={() => setShowInventory(true)} className="flex items-center gap-2 px-4 py-2 bg-banky-pink border-2 border-ink font-black uppercase shadow-sm hover:shadow-neo-sm transition-all text-xs md:text-sm"><Package className="w-4 h-4" /> Loot</button>
                </div>
            </div>

            {/* ADVENTURE LEVELS */}
            <div className="max-w-5xl mx-auto px-4 mt-12 mb-16 animate-fade-in">
                <h2 className="text-3xl font-black uppercase font-display mb-8 flex items-center gap-3">
                    <Globe className="w-8 h-8 text-banky-blue" />
                    Adventure Levels
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {modules.filter(m => m.category === 'Adventure').map((module) => (
                        <button
                            key={module.id}
                            onClick={() => handleStartModule(module)}
                            className={`group relative bg-white border-4 border-ink p-6 text-left transition-all hover:-translate-y-2 hover:shadow-neo-lg overflow-hidden ${module.isCompleted ? 'opacity-75' : ''}`}
                        >
                            <div className="absolute top-0 right-0 bg-banky-blue text-white px-3 py-1 font-black text-xs uppercase border-l-4 border-b-4 border-ink">
                                {module.estimatedTime}
                            </div>
                            <div className="flex items-start gap-4">
                                <div className={`w-16 h-16 border-2 border-ink flex items-center justify-center shadow-neo-sm group-hover:shadow-none transition-all ${module.isCompleted ? 'bg-banky-green' : 'bg-banky-yellow'}`}>
                                    {module.isCompleted ? <Check className="w-8 h-8" /> : <Globe className="w-8 h-8" />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase font-display mb-1 group-hover:text-banky-blue transition-colors">{module.title}</h3>
                                    <p className="text-sm font-bold text-gray-500 leading-tight">{module.description}</p>
                                    <div className="mt-3 flex items-center gap-2 text-xs font-black uppercase text-banky-purple">
                                        <Star className="w-4 h-4 fill-current" />
                                        {module.xpReward} XP
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* SIDE QUESTS */}
            <div className="max-w-5xl mx-auto px-4 mb-16 animate-fade-in">
                <h2 className="text-3xl font-black uppercase font-display mb-8 flex items-center gap-3">
                    <MapIcon className="w-8 h-8 text-banky-pink" />
                    Side Quests
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {modules.filter(m => m.isSideQuest).map((module) => (
                        <button
                            key={module.id}
                            onClick={() => handleStartModule(module)}
                            className={`bg-gray-50 border-2 border-ink p-4 text-left hover:bg-white hover:shadow-neo transition-all ${module.isCompleted ? 'opacity-60' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="bg-banky-pink text-white text-[10px] font-black uppercase px-2 py-0.5 border border-ink rounded-full">Optional</span>
                                <span className="text-xs font-bold text-gray-400">{module.estimatedTime}</span>
                            </div>
                            <h3 className="font-black uppercase text-sm mb-1">{module.title}</h3>
                            <p className="text-xs text-gray-500 line-clamp-2">{module.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* CORE CURRICULUM HEADER */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black uppercase font-display flex items-center justify-center gap-3">
                    <Book className="w-8 h-8 text-banky-green" />
                    Core Curriculum
                </h2>
            </div>

            {/* RESPONSIVE MAP CONTAINER */}
            <div className="relative w-full max-w-md mx-auto mt-10 md:mt-20 pb-32 animate-fade-in select-none">
                {/* SVG Path with responsive scaling */}
                <div className="w-full h-full relative" style={{ height: `${mapHeight}px` }}>
                    <svg
                        viewBox={`0 0 380 ${mapHeight}`}
                        className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible"
                        preserveAspectRatio="xMidYMin meet"
                    >
                        <path d={`M 190,0 ${modules.map((_, i) => { const y = i * 160 + 80; const x = i % 2 === 0 ? 80 : 300; return `Q 190,${y - 80} ${x},${y}`; }).join(" ")} L 190,${modules.length * 160 + 100}`} fill="none" stroke="#1A1A1A" strokeWidth="12" strokeLinecap="round" strokeDasharray="20 20" className="opacity-20" />
                    </svg>

                    {/* Module Nodes - Absolutely Positioned based on SVG Logic */}
                    {modules.map((unit, index) => {
                        const isPreviousCompleted = index === 0 || userState.completedUnitIds.includes(modules[index - 1].id);
                        const isLocked = !isPreviousCompleted;
                        const isCompleted = userState.completedUnitIds.includes(unit.id);
                        const isActive = !isLocked && !isCompleted;

                        const topPos = index * 160 + 80;
                        const leftPos = index % 2 === 0 ? '21%' : '79%';

                        return (
                            <div
                                key={unit.id}
                                className="absolute flex flex-col items-center group"
                                style={{
                                    top: `${topPos}px`,
                                    left: leftPos,
                                    transform: 'translate(-50%, -50%)',
                                    width: 'max-content'
                                }}
                            >
                                <button onClick={() => !isLocked && handleStartModule(unit)} disabled={isLocked} className={`w-24 h-24 rounded-full border-4 border-ink flex items-center justify-center relative transition-all duration-300 z-10 ${isCompleted ? 'bg-banky-green shadow-none scale-95 opacity-80' : isLocked ? 'bg-gray-200 cursor-not-allowed' : 'bg-banky-yellow hover:scale-110 shadow-neo hover:shadow-neo-sm'}`}>
                                    {isCompleted ? (
                                        <div className="relative"><Check className="w-10 h-10 text-ink" strokeWidth={4} /><div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-0.5">{[1, 2, 3].map(s => <Star key={s} className="w-3 h-3 fill-banky-yellow text-ink" />)}</div></div>
                                    ) : isLocked ? <Lock className="w-8 h-8 text-gray-400" /> : (
                                        <div className="relative"><span className="font-black text-3xl font-display">{index + 1}</span><div className="absolute inset-0 rounded-full border-2 border-white animate-ping opacity-50"></div></div>
                                    )}
                                    {isActive && <div className="absolute -top-16 left-1/2 -translate-x-1/2 pointer-events-none z-20 animate-bounce"><Mascot className="w-20 h-20" mood="happy" /></div>}
                                </button>
                                <div className={`absolute top-24 mt-4 bg-white border-2 border-ink px-4 py-2 shadow-neo-sm text-center min-w-[160px] transition-all z-20 ${isActive ? 'scale-105 rotate-1 bg-white' : isLocked ? 'opacity-50 grayscale' : 'bg-gray-50'}`}>
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                                        <h3 className="font-black uppercase font-display leading-none text-sm">{unit.title}</h3>
                                        {/* New: Live Context Button */}
                                        {!isLocked && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleLiveContext(unit.id, unit.title); }}
                                                className="ml-1 p-1 bg-banky-blue text-white rounded hover:bg-banky-purple transition-colors"
                                                title="Get Live Intel"
                                            >
                                                <Globe className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-wider">{unit.category}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {modules.length === 0 && (
                    <div className="text-center p-8 bg-white border-2 border-ink shadow-neo">
                        <p className="font-bold">No modules available for {region} yet.</p>
                        <p className="text-sm text-gray-500">Switch region or check back later!</p>
                    </div>
                )}
            </div>

            {/* --- PLAYBOOK MODAL --- (Existing Playbook code remains...) */}
            {showPlaybook && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white border-4 border-ink shadow-neo-xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-row relative">
                        <button onClick={() => setShowPlaybook(false)} className="absolute top-4 right-4 bg-gray-100 border-2 border-ink p-2 hover:bg-red-500 hover:text-white z-30"><X className="w-6 h-6" /></button>

                        {/* Sidebar */}
                        <div className="w-16 md:w-1/3 h-full border-r-4 border-ink bg-gray-50 flex flex-col flex-shrink-0 transition-all duration-300">
                            <div className="p-4 md:p-6 border-b-4 border-ink bg-banky-blue text-white flex flex-col md:block items-center justify-center">
                                <div className="flex items-center gap-2">
                                    <Book className="w-6 h-6 flex-shrink-0" />
                                    <h2 className="hidden md:block text-2xl font-black uppercase font-display">Playbook</h2>
                                </div>
                                <div className="hidden md:flex items-center gap-2 mt-1 opacity-80 text-xs font-bold uppercase tracking-widest"><Globe className="w-3 h-3" /> {region} Edition</div>
                            </div>
                            <div className="overflow-y-auto flex-1 p-0 md:p-2 space-y-0 md:space-y-2">
                                {modules.map((mod, idx) => {
                                    const isUnlocked = userState.completedUnitIds.includes(mod.id);
                                    const isActive = playbookModuleId === mod.id;
                                    return (
                                        <button
                                            key={mod.id}
                                            onClick={() => isUnlocked && setPlaybookModuleId(mod.id)}
                                            disabled={!isUnlocked}
                                            className={`w-full text-left p-3 md:p-4 border-b-2 md:border-2 transition-all flex items-center justify-center md:justify-between ${isActive ? 'bg-banky-yellow border-ink shadow-neo-sm md:translate-x-1' :
                                                isUnlocked ? 'bg-white border-gray-200 hover:border-ink hover:bg-white' :
                                                    'bg-gray-100 border-transparent opacity-50 cursor-not-allowed'
                                                }`}
                                        >
                                            <div className="hidden md:block">
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Unit {idx + 1}</span>
                                                <p className="font-black font-display text-sm uppercase">{mod.title}</p>
                                            </div>
                                            <div className="md:hidden font-black font-display text-xl">
                                                {idx + 1}
                                            </div>
                                            {!isUnlocked && <Lock className="w-4 h-4 md:ml-0 text-gray-400" />}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Main Content (Fixed Fonts) */}
                        <div className="w-full md:w-2/3 flex-1 bg-[#fffef0] flex flex-col relative">
                            {playbookModuleId ? (
                                <>
                                    {(() => {
                                        const module = modules.find(m => m.id === playbookModuleId);
                                        if (!module || !module.playbook) return null;
                                        return (
                                            <div className="flex-1 flex flex-col relative z-10">
                                                <div className="p-8 pb-4">
                                                    <h2 className="text-4xl font-black uppercase font-display mb-2 bg-white inline-block px-2 border-2 border-transparent">{module.title}</h2>
                                                    <div className="flex gap-2 border-b-4 border-ink bg-white/50 backdrop-blur-sm overflow-x-auto whitespace-nowrap pb-1 scrollbar-hide">
                                                        {[{ id: 'summary', label: 'Breakdown', icon: Split }, { id: 'real-life', label: 'Real Life', icon: Briefcase }, { id: 'dictionary', label: 'Dictionary', icon: BookOpen }, { id: 'actions', label: 'Actions', icon: Check }].map(tab => (
                                                            <button key={tab.id} onClick={() => setPlaybookTab(tab.id as 'summary' | 'real-life' | 'dictionary' | 'actions')} className={`flex items-center gap-2 px-4 py-3 font-black uppercase text-sm border-t-2 border-x-2 border-ink -mb-[4px] relative z-10 transition-all flex-shrink-0 ${playbookTab === tab.id ? 'bg-banky-pink text-ink shadow-[0_-2px_0_0_#1A1A1A]' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}><tab.icon className="w-4 h-4" /> {tab.label}</button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex-1 overflow-y-auto p-8 pt-4">
                                                    <div className="bg-white border-2 border-ink p-8 shadow-sm min-h-full animate-fade-in">
                                                        {playbookTab === 'summary' && (
                                                            <div>
                                                                <h3 className="text-xl font-black uppercase mb-4 font-display flex items-center gap-2"><Split className="w-5 h-5 text-banky-blue" /> The Breakdown</h3>
                                                                <p className="text-lg font-medium leading-relaxed font-sans text-gray-800">{module.playbook.summary}</p>
                                                            </div>
                                                        )}
                                                        {playbookTab === 'real-life' && (
                                                            <div>
                                                                <h3 className="text-xl font-black uppercase mb-4 font-display flex items-center gap-2"><Briefcase className="w-5 h-5 text-banky-green" /> In The Wild</h3>
                                                                <div className="bg-gray-50 border-l-4 border-banky-green p-6 text-lg font-medium font-sans text-gray-700 italic">
                                                                    "{module.playbook.realLifeExample}"
                                                                </div>
                                                            </div>
                                                        )}
                                                        {playbookTab === 'dictionary' && (
                                                            <div>
                                                                <h3 className="text-xl font-black uppercase mb-4 font-display flex items-center gap-2"><BookOpen className="w-5 h-5 text-banky-pink" /> Jargon Buster</h3>
                                                                <div className="space-y-4">
                                                                    {module.playbook.definitions.map((def, i) => (
                                                                        <div key={i} className="border-b-2 border-gray-100 pb-4 last:border-0">
                                                                            <p className="font-black font-display text-lg bg-banky-yellow inline-block px-1 mb-1">{def.term}</p>
                                                                            <p className="font-medium font-sans text-gray-700">{def.definition}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {playbookTab === 'actions' && (
                                                            <div>
                                                                <h3 className="text-xl font-black uppercase mb-4 font-display flex items-center gap-2"><Check className="w-5 h-5 text-ink" /> Your Move</h3>
                                                                <ul className="space-y-4">
                                                                    {module.playbook.actionableSteps.map((step, i) => (
                                                                        <li key={i} className="flex items-start gap-3">
                                                                            <div className="w-6 h-6 border-2 border-ink rounded flex items-center justify-center flex-shrink-0 mt-0.5 bg-white"></div>
                                                                            <span className="font-bold text-lg font-sans">{step}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })()}
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-12 text-center">
                                    <Book className="w-16 h-16 mb-4 opacity-20" />
                                    <p className="font-bold font-display text-xl">Select a Unit</p>
                                    <p>Choose an unlocked module from the left.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showInventory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-paper border-4 border-ink shadow-neo-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col relative">
                        <button onClick={() => setShowInventory(false)} className="absolute top-4 right-4 bg-white border-2 border-ink p-2 hover:bg-gray-100 z-10"><X className="w-6 h-6" /></button>
                        <div className="p-6 border-b-4 border-ink bg-banky-pink"><h2 className="text-3xl font-black uppercase font-display flex items-center gap-3"><Package className="w-8 h-8" /> My Stash</h2></div>
                        <div className="p-8 overflow-y-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {userState.inventory.length === 0 ? (
                                <div className="col-span-full text-center py-12 text-gray-400"><Package className="w-16 h-16 mx-auto mb-4 opacity-20" /><p className="font-bold">Your bag is empty.</p><p className="text-sm">Complete lessons to earn loot.</p></div>
                            ) : (
                                userState.inventory.map((itemId, idx) => {
                                    const item = LOOT_TABLE.find(l => l.id === itemId);
                                    if (!item) return null;
                                    return (
                                        <div key={`${itemId}-${idx}`} className="bg-white border-2 border-ink p-4 flex flex-col items-center text-center shadow-sm hover:scale-105 transition-transform"><div className="text-4xl mb-2 animate-bounce-slow">{item.emoji}</div><p className="font-black text-xs uppercase leading-tight">{item.name}</p><span className={`text-[10px] font-bold px-1.5 py-0.5 mt-2 border border-ink rounded ${item.rarity === 'Legendary' ? 'bg-banky-yellow' : item.rarity === 'Rare' ? 'bg-banky-blue text-white' : 'bg-gray-100 text-gray-500'}`}>{item.rarity}</span></div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showVictory && earnedLoot && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/90 backdrop-blur-md animate-fade-in">
                    <div className="bg-white border-4 border-ink shadow-neo-xl max-w-sm w-full p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,#D4FF00_0deg,#fff_60deg,#D4FF00_120deg,#fff_180deg,#D4FF00_240deg,#fff_300deg,#D4FF00_360deg)] opacity-20 animate-spin-slow"></div>
                        <div className="relative z-10"><div className="inline-block bg-banky-green text-ink border-2 border-ink px-3 py-1 font-black uppercase rotate-[-2deg] mb-6 shadow-sm">Module Complete!</div><div className="w-32 h-32 mx-auto bg-white border-4 border-ink rounded-full flex items-center justify-center text-6xl shadow-neo mb-6 animate-bounce">{earnedLoot.emoji}</div><h2 className="text-2xl font-black uppercase font-display mb-1">{earnedLoot.name}</h2><p className="font-bold text-gray-500 uppercase text-xs tracking-widest mb-6">{earnedLoot.rarity} Item Found</p><div className="flex gap-4 justify-center font-bold font-mono text-sm mb-8"><div className="flex items-center gap-1 bg-gray-100 px-2 py-1 border border-gray-300"><Star className="w-4 h-4 text-banky-yellow fill-current" />+{activeModule?.xpReward} XP</div></div><button onClick={closeVictory} className="w-full bg-ink text-white py-4 font-black uppercase tracking-widest border-2 border-transparent hover:bg-banky-pink hover:text-ink hover:border-ink hover:shadow-neo transition-all">Claim Reward</button></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Education;
