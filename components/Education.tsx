
import React, { useState, useEffect } from 'react';
import { useBanky } from '../context/useBanky';
import { EducationModule, LessonOption, RegionCode, LessonStep, AllocatorCategory } from '../types';
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
const BASE_MODULES: EducationModule[] = [
    // UNIT 1: BASICS
    {
        id: 'unit-1',
        title: 'The Money Mindset',
        description: 'Stop thinking poor. Start thinking wealthy.',
        xpReward: 100,
        isCompleted: false,
        category: 'Basics',
        estimatedTime: '5m',
        playbook: {
            summary: "Wealth isn't about income; it's about retention. The Golden Rule: Assets feed you, Liabilities eat you.",
            realLifeExample: "Alex buys a $50k car (Liability). Sam buys $50k of Index Funds (Asset). In 5 years, the car is worth $20k. The stock is worth $90k.",
            definitions: [
                { term: "Asset", definition: "Puts money IN your pocket." },
                { term: "Liability", definition: "Takes money OUT of your pocket." },
                { term: "Net Worth", definition: "Assets minus Liabilities." }
            ],
            actionableSteps: ["List your Assets vs Liabilities.", "Cancel one unused subscription today."]
        },
        steps: [
            { id: '1-1', type: 'info', content: 'Wealth isn\'t just cash. It\'s "Assets"—things that put money IN your pocket while you sleep.' },
            { id: '1-2', type: 'puzzle', content: 'Decode: A thing that puts money in your pocket.', scramble: 'STSEA', puzzleWord: 'ASSET', hint: 'Opposite of Liability.', correctAnswerExplanation: 'An ASSET is anything that puts money in your pocket (like stocks or real estate). A Liability takes it out.' },
            { id: '1-3', type: 'fill-blank', content: 'Rich people buy [BLANK], poor people buy liabilities.', fillBlankCorrect: 'Assets', fillBlankOptions: ['Assets', 'Liabilities', 'Stuff'], correctAnswerExplanation: 'Wealthy people prioritize buying income-generating assets first, then use that income to buy luxuries.' },
            {
                id: '1-4', type: 'question', content: 'The goal of the game is to...', options: [
                    { id: 'a', text: 'Buy more liabilities', isCorrect: false, feedback: 'Wrong. That is how you stay broke forever.' },
                    { id: 'b', text: 'Work harder forever', isCorrect: false, feedback: 'Nope. Even hustle culture has limits.' },
                    { id: 'c', text: 'Buy assets that pay for your liabilities', isCorrect: true, feedback: 'Bingo! That is financial freedom.' }
                ], correctAnswerExplanation: 'Financial Freedom is when your assets generate enough cash flow to pay for your lifestyle.'
            }
        ]
    },
    {
        id: 'unit-2',
        title: 'Budgeting 101',
        description: 'Tell your money where to go.',
        xpReward: 150,
        isCompleted: false,
        category: 'Basics',
        estimatedTime: '5m',
        playbook: {
            summary: "A budget isn't a restriction; it's a plan. The 50/30/20 rule is the easiest way to start.",
            realLifeExample: "Earn $3000? $1500 for Needs, $900 for Wants, $600 for Savings/Investing.",
            definitions: [
                { term: "Needs", definition: "Rent, Food, Utilities." },
                { term: "Wants", definition: "Netflix, Dining Out, Travel." },
                { term: "Savings", definition: "Investing, Emergency Fund." }
            ],
            actionableSteps: ["Review last month's bank statement.", "Categorize expenses into Needs/Wants."]
        },
        steps: [
            { id: '2-1', type: 'info', content: 'The 50/30/20 Rule: 50% Needs, 30% Wants, 20% Savings.' },
            { id: '2-2', type: 'sorting', content: 'Sort these into "Needs" (Top) vs "Wants" (Bottom).', sortCorrectOrder: ['Rent', 'Groceries', 'Netflix', 'Designer Shoes'], correctAnswerExplanation: 'Rent and Food are survival needs. Streaming and Fashion are wants.' },
            {
                id: '2-3', type: 'question', content: 'If you earn $1000, how much should go to savings?', options: [
                    { id: 'a', text: '$100', isCorrect: false, feedback: 'Too low! You can do better.' },
                    { id: 'b', text: '$200', isCorrect: true, feedback: 'Correct! 20% of $1000 is $200.' },
                    { id: 'c', text: '$500', isCorrect: false, feedback: 'Ambitious, but 50% is hard to sustain unless you live in a van.' }
                ]
            }
        ]
    },
    {
        id: 'unit-3',
        title: 'Compound Interest',
        description: 'The 8th Wonder of the World.',
        xpReward: 200,
        isCompleted: false,
        category: 'Investing',
        estimatedTime: '6m',
        playbook: {
            summary: "Compound interest is the snowball effect for money. Your interest earns its own interest.",
            realLifeExample: "Invest $100/mo at 10%. In 40 years, you put in $48k, but have $632k. That is the power of time.",
            definitions: [
                { term: "Compound Interest", definition: "Interest calculated on the initial principal and also on the accumulated interest." },
                { term: "Exponential Growth", definition: "Growth whose rate becomes ever more rapid in proportion to the growing total number or size." }
            ],
            actionableSteps: ["Start investing early.", "Reinvest your dividends."]
        },
        steps: [
            { id: '3-1', type: 'info', content: 'Compound interest is interest on interest. It makes money grow exponentially.' },
            { id: '3-2', type: 'fill-blank', content: 'Time in the market beats [BLANK] the market.', fillBlankCorrect: 'Timing', fillBlankOptions: ['Timing', 'Trading', 'Selling'] },
            { id: '3-3', type: 'puzzle', content: 'Unscramble: The curve of growth.', scramble: 'XPONENTE', puzzleWord: 'EXPONENT', hint: 'Goes up fast.' }
        ]
    },
    {
        id: 'unit-4',
        title: 'The Emergency Fund',
        description: 'Sleep well at night.',
        xpReward: 150,
        isCompleted: false,
        category: 'Basics',
        estimatedTime: '5m',
        playbook: {
            summary: "An emergency fund is your financial shield. It prevents you from using debt when life happens.",
            realLifeExample: "Car breaks down ($1000). No fund = Credit Card debt at 20%. With fund = $0 debt.",
            definitions: [
                { term: "Liquidity", definition: "How quickly you can get cash." },
                { term: "High Yield Savings", definition: "A bank account that pays higher interest than standard ones." }
            ],
            actionableSteps: ["Open a High Yield Savings Account.", "Save $1000 fast."]
        },
        steps: [
            { id: '4-1', type: 'info', content: 'An emergency fund prevents you from going into debt when bad things happen.' },
            {
                id: '4-2', type: 'question', content: 'How much should be in an emergency fund?', options: [
                    { id: 'a', text: '$500', isCorrect: false, feedback: 'A good start, but that barely covers a flat tire.' },
                    { id: 'b', text: '3-6 months of expenses', isCorrect: true, feedback: 'Yes. This covers job loss or major repairs.' },
                    { id: 'c', text: '1 year of income', isCorrect: false, feedback: 'A bit overkill. You are losing money to inflation.' }
                ]
            }
        ]
    },
    {
        id: 'unit-5',
        title: 'Bad Debt vs Good Debt',
        description: 'Not all debt is created equal.',
        xpReward: 200,
        isCompleted: false,
        category: 'Basics',
        estimatedTime: '6m',
        playbook: {
            summary: "Not all debt is evil. Good debt buys assets (House). Bad debt buys liabilities (Shoes).",
            realLifeExample: "Mortgage at 3% allows you to own a home. Credit card at 25% for a vacation destroys your wealth.",
            definitions: [
                { term: "Principal", definition: "The original sum of money borrowed in a loan." },
                { term: "Interest Rate", definition: "The proportion of a loan that is charged as interest to the borrower." }
            ],
            actionableSteps: ["List all your debts.", "Identify which are 'Bad' (High Interest)."]
        },
        steps: [
            { id: '5-1', type: 'sorting', content: 'Order from "Worst Debt" to "Best Debt".', sortCorrectOrder: ['Payday Loan', 'Credit Card (20%)', 'Student Loan (5%)', 'Mortgage (3%)'] },
            {
                id: '5-2', type: 'question', content: 'Why is a mortgage considered "Good Debt"?', options: [
                    { id: 'a', text: 'It isn\'t.', isCorrect: false, feedback: 'Incorrect. Real estate generally appreciates.' },
                    { id: 'b', text: 'It buys an appreciating asset.', isCorrect: true, feedback: 'Correct. The house value usually goes up over time.' }
                ]
            }
        ]
    },
    {
        id: 'unit-6',
        title: 'Stocks & Equities',
        description: 'Owning a piece of a company.',
        xpReward: 250,
        isCompleted: false,
        category: 'Investing',
        estimatedTime: '7m',
        playbook: {
            summary: "Stocks represent ownership in a company. Over the long run, they are the best wealth builder.",
            realLifeExample: "If you bought $1000 of Apple in 2000, it would be worth over $150,000 today.",
            definitions: [
                { term: "Share", definition: "One unit of ownership in a company." },
                { term: "Market Cap", definition: "The total value of a company's shares." }
            ],
            actionableSteps: ["Open a brokerage account.", "Buy your first fractional share."]
        },
        steps: [
            { id: '6-1', type: 'info', content: 'When you buy a stock, you become a partial owner of that business.' },
            { id: '6-2', type: 'fill-blank', content: 'A [BLANK] is a payment of profit to shareholders.', fillBlankCorrect: 'Dividend', fillBlankOptions: ['Dividend', 'Coupon', 'Interest'] },
            { id: '6-3', type: 'puzzle', content: 'Unscramble: A collection of stocks.', scramble: 'TF E', puzzleWord: 'ETF', hint: 'Exchange Traded Fund.' }
        ]
    },
    {
        id: 'unit-7',
        title: 'ETFs & Index Funds',
        description: 'Don\'t find the needle, buy the haystack.',
        xpReward: 300,
        isCompleted: false,
        category: 'Investing',
        estimatedTime: '6m',
        playbook: {
            summary: "Don't look for the needle in the haystack. Just buy the haystack. Index funds own everything.",
            realLifeExample: "S&P 500 ETF (VOO) owns the 500 biggest US companies. If one fails, you are still fine.",
            definitions: [
                { term: "ETF", definition: "Exchange Traded Fund. A basket of stocks you can buy like a single stock." },
                { term: "Diversification", definition: "Spreading risk across many investments." }
            ],
            actionableSteps: ["Research 'S&P 500 ETF'.", "Set up auto-investing."]
        },
        steps: [
            { id: '7-1', type: 'info', content: 'Index funds track the whole market (like S&P 500). They are lower risk than picking single stocks.' },
            {
                id: '7-2', type: 'question', content: 'What is the main benefit of an ETF?', options: [
                    { id: 'a', text: 'Guaranteed 100% returns', isCorrect: false, feedback: 'Nothing is guaranteed. Not even your haircut.' },
                    { id: 'b', text: 'Diversification', isCorrect: true, feedback: 'Yes! You own hundreds of companies at once.' }
                ]
            }
        ]
    },
    {
        id: 'unit-8',
        title: 'The Credit Score',
        description: 'Your financial report card.',
        xpReward: 200,
        isCompleted: false,
        category: 'Credit',
        estimatedTime: '6m',
        playbook: {
            summary: "Your credit score is a measure of your trustworthiness to lenders. High score = Cheap loans.",
            realLifeExample: "700 score gets a 3% mortgage. 600 score gets a 5% mortgage. The difference is $100,000 over 30 years.",
            definitions: [
                { term: "FICO", definition: "The most common credit scoring model." },
                { term: "Credit Bureau", definition: "Agencies that collect data on consumer credit behavior." }
            ],
            actionableSteps: ["Check your credit report for free.", "Pay all bills on time."]
        },
        steps: [
            { id: '8-1', type: 'info', content: 'Your FICO score determines if you can get a loan and what interest rate you pay.' },
            { id: '8-2', type: 'fill-blank', content: 'Keep your credit utilization below [BLANK]%.', fillBlankCorrect: '30', fillBlankOptions: ['30', '50', '80'] },
            {
                id: '8-3', type: 'question', content: 'What hurts your score the most?', options: [
                    { id: 'a', text: 'Checking your own score', isCorrect: false, feedback: 'Myth! Soft pulls don\'t hurt.' },
                    { id: 'b', text: 'Missing a payment', isCorrect: true, feedback: 'Yes. Payment history is 35% of your score.' }
                ]
            }
        ]
    },
    {
        id: 'unit-9',
        title: 'Credit Cards: A Weapon',
        description: 'Use them, don\'t let them use you.',
        xpReward: 200,
        isCompleted: false,
        category: 'Credit',
        estimatedTime: '5m',
        playbook: {
            summary: "Credit cards are like chainsaws. Useful tools if handled with care, dangerous if reckless.",
            realLifeExample: "Pay in full = Free points and fraud protection. Carry a balance = 20% interest penalty.",
            definitions: [
                { term: "APR", definition: "Annual Percentage Rate. The cost of borrowing." },
                { term: "Grace Period", definition: "Time you have to pay your bill before interest starts." }
            ],
            actionableSteps: ["Set up auto-pay for the full statement balance."]
        },
        steps: [
            { id: '9-1', type: 'info', content: 'Credit cards offer rewards and fraud protection, but high interest if unpaid.' },
            {
                id: '9-2', type: 'question', content: 'How do you avoid interest?', options: [
                    { id: 'a', text: 'Pay the minimum', isCorrect: false, feedback: 'Trap! You will still be charged interest on the rest.' },
                    { id: 'b', text: 'Pay the full balance', isCorrect: true, feedback: 'Correct. Pay in full every month = $0 interest.' }
                ]
            }
        ]
    },
    {
        id: 'unit-10',
        title: 'Taxes 101',
        description: 'Uncle Sam wants his cut.',
        xpReward: 250,
        isCompleted: false,
        category: 'Taxes',
        estimatedTime: '7m',
        playbook: {
            summary: "Taxes are your biggest lifetime expense. Understanding them saves you thousands.",
            realLifeExample: "Earning $100k doesn't mean you keep $100k. After taxes, it might be $75k.",
            definitions: [
                { term: "Gross Income", definition: "Total earnings before taxes." },
                { term: "Net Income", definition: "Take-home pay after taxes." }
            ],
            actionableSteps: ["Look at your pay stub.", "See how much goes to taxes."]
        },
        steps: [
            { id: '10-1', type: 'info', content: 'Gross income is what you earn. Net income is what you keep after taxes.' },
            { id: '10-2', type: 'puzzle', content: 'Unscramble: Money back from the gov.', scramble: 'DNEFUR', puzzleWord: 'REFUND', hint: 'Tax season bonus.' },
            { id: '10-3', type: 'fill-blank', content: 'A tax [BLANK] reduces your taxable income.', fillBlankCorrect: 'Deduction', fillBlankOptions: ['Deduction', 'Evasion', 'Bill'] }
        ]
    },
    {
        id: 'unit-11',
        title: 'Retirement Accounts',
        description: 'Free money from the government.',
        xpReward: 300,
        isCompleted: false,
        category: 'Investing',
        estimatedTime: '6m',
        playbook: {
            summary: "Retirement accounts are tax shelters. They protect your money from taxes so it grows faster.",
            realLifeExample: "401k Match is free money. If you put in $1 and your boss puts in $1, you just made 100% return instantly.",
            definitions: [
                { term: "401k", definition: "Employer-sponsored retirement plan." },
                { term: "IRA", definition: "Individual Retirement Account." }
            ],
            actionableSteps: ["Log into your 401k provider.", "Check if you are getting the full match."]
        },
        steps: [
            { id: '11-1', type: 'connections', content: 'Match the account to its benefit.', connectionPairs: [{ term: '401k', match: 'Employer Match' }, { term: 'Roth IRA', match: 'Tax-Free Growth' }, { term: 'Traditional IRA', match: 'Tax Deduction Now' }] },
            {
                id: '11-2', type: 'question', content: 'If your employer offers a match, you should...', options: [
                    { id: 'a', text: 'Ignore it', isCorrect: false, feedback: 'Never turn down free money. Are you allergic to cash?' },
                    { id: 'b', text: 'Contribute enough to get it', isCorrect: true, feedback: 'Always take the match. It is an instant 100% return.' }
                ]
            }
        ]
    },
    {
        id: 'unit-12',
        title: 'Inflation',
        description: 'The silent killer of cash.',
        xpReward: 150,
        isCompleted: false,
        category: 'Economics',
        estimatedTime: '5m',
        playbook: {
            summary: "Inflation is the invisible tax. It makes your cash worth less every year.",
            realLifeExample: "A movie ticket cost $5 in 2000. Today it is $15. Your $5 bill didn't change, but its power did.",
            definitions: [
                { term: "Inflation Rate", definition: "The percentage increase in prices over a year." },
                { term: "Purchasing Power", definition: "The value of a currency expressed in terms of the amount of goods or services that one unit of money can buy." }
            ],
            actionableSteps: ["Invest cash that you don't need for 5+ years."]
        },
        steps: [
            { id: '12-1', type: 'info', content: 'Inflation means things get more expensive over time. Cash loses value.' },
            {
                id: '12-2', type: 'question', content: 'If inflation is 3% and your bank pays 0.1%...', options: [
                    { id: 'a', text: 'You are losing purchasing power', isCorrect: true, feedback: 'Correct. You effectively lost 2.9% of value.' },
                    { id: 'b', text: 'You are making money', isCorrect: false, feedback: 'Math error. You are losing money safely.' }
                ]
            }
        ]
    },
    {
        id: 'unit-13',
        title: 'Real Estate',
        description: 'Land: They aren\'t making any more of it.',
        xpReward: 300,
        isCompleted: false,
        category: 'Assets',
        estimatedTime: '7m',
        playbook: {
            summary: "Real estate is a tangible asset. You can live in it, rent it out, or sell it for a profit.",
            realLifeExample: "Buying a duplex. You live in one side, tenant pays rent on the other. Their rent pays your mortgage.",
            definitions: [
                { term: "Equity", definition: "The difference between what your home is worth and what you owe." },
                { term: "Appreciation", definition: "Increase in value over time." }
            ],
            actionableSteps: ["Research 'House Hacking'."]
        },
        steps: [
            { id: '13-1', type: 'fill-blank', content: 'Rental income is a form of [BLANK] cash flow.', fillBlankCorrect: 'Passive', fillBlankOptions: ['Passive', 'Active', 'Negative'] },
            { id: '13-2', type: 'puzzle', content: 'Unscramble: The loan for a house.', scramble: 'EGAGTROM', puzzleWord: 'MORTGAGE', hint: 'Monthly house payment.' }
        ]
    },
    {
        id: 'unit-14',
        title: 'Crypto & High Risk',
        description: 'High risk, high reward (maybe).',
        xpReward: 250,
        isCompleted: false,
        category: 'Investing',
        estimatedTime: '6m',
        playbook: {
            summary: "High risk assets can make you rich or broke. Only invest what you can afford to lose.",
            realLifeExample: "Bitcoin went from $60k to $16k in a year. If you needed that money for rent, you were in trouble.",
            definitions: [
                { term: "Volatility", definition: "How much a price swings up and down." },
                { term: "Speculation", definition: "Buying something hoping someone else pays more later." }
            ],
            actionableSteps: ["Limit crypto to 5% of your portfolio."]
        },
        steps: [
            { id: '14-1', type: 'info', content: 'Crypto is volatile. Never invest money you cannot afford to lose.' },
            { id: '14-2', type: 'sorting', content: 'Sort by Risk (Low to High).', sortCorrectOrder: ['Savings Account', 'Index Fund', 'Individual Stock', 'Crypto/NFT'] }
        ]
    },
    {
        id: 'unit-15',
        title: 'Side Hustles',
        description: 'Multiple streams of income.',
        xpReward: 200,
        isCompleted: false,
        category: 'Business',
        estimatedTime: '5m',
        playbook: {
            summary: "A side hustle is a way to increase your income without quitting your job. It accelerates your wealth.",
            realLifeExample: "Walking dogs on weekends for $200 extra a month. Invest that $200 and it becomes $100k in 30 years.",
            definitions: [
                { term: "Active Income", definition: "Trading time for money." },
                { term: "Scalability", definition: "Ability to grow revenue without increasing work linearly." }
            ],
            actionableSteps: ["List 3 skills you can sell."]
        },
        steps: [
            {
                id: '15-1', type: 'question', content: 'The best side hustle is...', options: [
                    { id: 'a', text: 'Driving Uber', isCorrect: false, feedback: 'It pays, but it is not scalable. You are trading time for money.' },
                    { id: 'b', text: 'One that scales or teaches skills', isCorrect: true, feedback: 'Correct. Build assets or skills, not just hourly wages.' }
                ]
            }
        ]
    },
    {
        id: 'unit-16',
        title: 'Negotiation Power',
        description: 'Ask and you shall receive.',
        xpReward: 300,
        isCompleted: false,
        category: 'Business',
        estimatedTime: '6m',
        playbook: {
            summary: "Everything is negotiable. Salary, rent, bills. If you don't ask, the answer is always no.",
            realLifeExample: "Calling your internet provider and saying 'I'm thinking of switching' can save you $20/mo.",
            definitions: [
                { term: "Leverage", definition: "Power to influence a situation." },
                { term: "Counter-offer", definition: "An offer made in response to another." }
            ],
            actionableSteps: ["Negotiate one bill this week."]
        },
        steps: [
            { id: '16-1', type: 'info', content: 'Your salary is negotiable. Never accept the first offer immediately.' },
            { id: '16-2', type: 'fill-blank', content: 'Always do your [BLANK] on market rates before negotiating.', fillBlankCorrect: 'Research', fillBlankOptions: ['Research', 'Guessing', 'Complaining'] }
        ]
    },
    {
        id: 'unit-17',
        title: 'Financial Independence (FIRE)',
        description: 'Retire early, live freely.',
        xpReward: 500,
        isCompleted: false,
        category: 'Advanced',
        estimatedTime: '8m',
        playbook: {
            summary: "FIRE = Financial Independence, Retire Early. It's about freedom, not just not working.",
            realLifeExample: "Saving 50% of your income allows you to retire in roughly 17 years.",
            definitions: [
                { term: "Savings Rate", definition: "Percentage of income you save." },
                { term: "Financial Independence", definition: "When passive income > expenses." }
            ],
            actionableSteps: ["Calculate your savings rate."]
        },
        steps: [
            { id: '17-1', type: 'info', content: 'The 4% Rule: If you can live on 4% of your portfolio, you are financially free.' },
            {
                id: '17-2', type: 'question', content: 'If you spend $40k a year, how much do you need to retire?', options: [
                    { id: 'a', text: '$400k', isCorrect: false, feedback: 'Too low. You will run out of money in 10 years.' },
                    { id: 'b', text: '$1 Million', isCorrect: true, feedback: 'Correct. $1M * 4% = $40,000.' }
                ]
            }
        ]
    },
    {
        id: 'unit-18',
        title: 'Bull vs Bear',
        description: 'Decode the market animal kingdom.',
        xpReward: 300,
        isCompleted: false,
        category: 'Investing',
        estimatedTime: '5m',
        playbook: {
            summary: "Markets move in cycles. Bulls go up, Bears go down. Don't fear the Bear, it's a sale.",
            realLifeExample: "In 2008, the market crashed (Bear). People who bought then made huge profits in the following Bull market.",
            definitions: [
                { term: "Bull Market", definition: "Market is rising and optimism is high." },
                { term: "Bear Market", definition: "Market falls 20% or more." }
            ],
            actionableSteps: ["Don't check your portfolio daily."]
        },
        steps: [
            { id: '18-1', type: 'info', content: 'Markets move in cycles. "Bull" means up (horns thrust up). "Bear" means down (claws swipe down).' },
            { id: '18-2', type: 'connections', content: 'Connect the term to the definition.', connectionPairs: [{ term: 'Bull Market', match: 'Prices Rising' }, { term: 'Bear Market', match: 'Prices Falling' }, { term: 'Correction', match: 'Drop of 10%' }] },
            {
                id: '18-3', type: 'question', content: 'What is the best strategy in a Bear Market?', options: [
                    { id: 'a', text: 'Panic Sell', isCorrect: false, feedback: 'Never panic sell. You lock in losses.' },
                    { id: 'b', text: 'Buy the dip', isCorrect: true, feedback: 'Correct. Stocks are on sale.' }
                ]
            }
        ]
    },
    {
        id: 'unit-19',
        title: 'Scam Dojo',
        description: 'Defend your digital wallet.',
        xpReward: 350,
        isCompleted: false,
        category: 'Basics',
        estimatedTime: '6m',
        playbook: {
            summary: "Scammers prey on fear and greed. If it sounds too good to be true, it is.",
            realLifeExample: "A text saying 'Your account is locked, click here' is a phishing scam to steal your password.",
            definitions: [
                { term: "Phishing", definition: "Fake emails/texts looking like real companies." },
                { term: "Social Engineering", definition: "Manipulating people into giving up confidential info." }
            ],
            actionableSteps: ["Enable 2-Factor Authentication (2FA) on everything."]
        },
        steps: [
            { id: '19-1', type: 'sorting', content: 'Sort into Safe vs Scam.', sortCorrectOrder: ['Bank App', 'Official Email', 'IG DM "Free Crypto"', 'WhatsApp "IRS Agent"'] },
            {
                id: '19-2', type: 'question', content: 'Your bank calls asking for your password. You...', options: [
                    { id: 'a', text: 'Give it to them', isCorrect: false, feedback: 'Banks NEVER ask for passwords. Never.' },
                    { id: 'b', text: 'Hang up and call the official number', isCorrect: true, feedback: 'Always verify the source.' }
                ]
            }
        ]
    },
    {
        id: 'unit-20',
        title: 'Networking 2.0',
        description: 'Your network is your net worth.',
        xpReward: 300,
        isCompleted: false,
        category: 'Business',
        estimatedTime: '5m',
        playbook: {
            summary: "Your network is your net worth. It's not about using people, it's about helping them.",
            realLifeExample: "Sending a 'How can I help you?' email to someone you admire is better than asking for a job.",
            definitions: [
                { term: "Networking", definition: "Building professional relationships." },
                { term: "Value Add", definition: "Contributing something useful to others." }
            ],
            actionableSteps: ["Connect with 3 people in your field on LinkedIn."]
        },
        steps: [
            { id: '20-1', type: 'fill-blank', content: 'People do business with people they [BLANK].', fillBlankCorrect: 'Trust', fillBlankOptions: ['Trust', 'Fear', 'Pay'] },
            {
                id: '20-2', type: 'question', content: 'The best way to network is...', options: [
                    { id: 'a', text: 'Asking for favors immediately', isCorrect: false, feedback: 'No. Give value first.' },
                    { id: 'b', text: 'Providing value to others', isCorrect: true, feedback: 'Correct. Help others get what they want.' }
                ]
            }
        ]
    },
    {
        id: 'unit-21',
        title: 'Auto-Pilot Wealth',
        description: 'Set it and forget it.',
        xpReward: 400,
        isCompleted: false,
        category: 'Basics',
        estimatedTime: '4m',
        playbook: {
            summary: "Willpower is a finite resource. Automation is infinite. Set your money to move automatically on payday.",
            realLifeExample: "You set up a $500 auto-transfer to savings on the 1st. You don't even see the money, so you don't spend it.",
            definitions: [
                { term: "Automation", definition: "Using technology to perform tasks without human intervention." },
                { term: "Pay Yourself First", definition: "Saving before spending." }
            ],
            actionableSteps: ["Set up one auto-transfer today."]
        },
        steps: [
            { id: '21-1', type: 'info', content: 'Willpower fails. Automation doesn\'t. Automate your savings and bills.' },
            { id: '21-2', type: 'puzzle', content: 'Unscramble: Automatic payments.', scramble: 'TOUA YAP', puzzleWord: 'AUTOPAY', hint: 'Never miss a bill.' }
        ]
    },
    {
        id: 'unit-22',
        title: 'The Final Boss',
        description: 'Test everything you have learned.',
        xpReward: 1000,
        isCompleted: false,
        category: 'Advanced',
        estimatedTime: '10m',
        playbook: {
            summary: "You have learned the basics. Now it's about execution. Knowledge without action is poverty.",
            realLifeExample: "Knowing how to do a pushup doesn't make you strong. Doing them does.",
            definitions: [
                { term: "Execution", definition: "The carrying out of a plan." },
                { term: "Consistency", definition: "Doing small things repeatedly over time." }
            ],
            actionableSteps: ["Review your financial goals."]
        },
        steps: [
            { id: '22-1', type: 'question', content: 'Which asset class historically has the highest return?', options: [{ id: 'a', text: 'Cash', isCorrect: false, feedback: 'Loses to inflation.' }, { id: 'b', text: 'Stocks', isCorrect: true, feedback: 'Avg 10% per year.' }] },
            { id: '22-2', type: 'sorting', content: 'Order the steps to wealth.', sortCorrectOrder: ['Earn Income', 'Save Emergency Fund', 'Pay High Interest Debt', 'Invest in Index Funds'] },
            { id: '22-3', type: 'connections', content: 'Match the concepts.', connectionPairs: [{ term: 'Inflation', match: 'Prices Up' }, { term: 'Deflation', match: 'Prices Down' }, { term: 'Stagflation', match: 'Stagnant + Inflation' }] },
            { id: '22-4', type: 'puzzle', content: 'Decode the goal.', scramble: 'MODEERF', puzzleWord: 'FREEDOM', hint: 'What money buys.' }
        ]
    },
    {
        id: 'unit-23',
        title: 'Brain vs Marketing',
        description: 'Don\'t get played by the pros.',
        xpReward: 300,
        isCompleted: false,
        category: 'Basics',
        estimatedTime: '6m',
        playbook: {
            summary: "Marketers use psychology to make you spend. Common tricks: Scarcity ('Only 2 left!'), Anchoring (Fake high price crossed out), and Decoys.",
            realLifeExample: "Popcorn: Small $3, Medium $6.50, Large $7. The Medium exists only to make the Large look like a deal.",
            definitions: [
                { term: "Anchoring", definition: "Relying on the first piece of info (price) offered." },
                { term: "Loss Aversion", definition: "Fear of missing out > Joy of gaining." }
            ],
            actionableSteps: ["Wait 24 hours before buying non-essentials.", "Ignore 'original' prices, look at final cost."]
        },
        steps: [
            { id: '23-1', type: 'info', content: 'The "Decoy Effect" makes you buy the expensive option by adding a bad middle option.' },
            {
                id: '23-2', type: 'scenario', content: 'You see 3 subscriptions. Which one is the Decoy?', scenarioOptions: [
                    { text: 'Digital Only: $50', isCorrect: false, feedback: 'This is the basic option.' },
                    { text: 'Print Only: $120', isCorrect: true, feedback: 'Correct! It costs the same as Print + Digital but offers less. It exists to push you to the Bundle.' },
                    { text: 'Print + Digital: $120', isCorrect: false, feedback: 'This is the target "Deal".' }
                ]
            },
            { id: '23-3', type: 'puzzle', content: 'Decode: Fear of Missing Out.', scramble: 'OMFO', puzzleWord: 'FOMO', hint: 'Social pressure to buy.' }
        ]
    },
    {
        id: 'unit-24',
        title: 'Shield Up (Insurance)',
        description: 'Protect your loot.',
        xpReward: 300,
        isCompleted: false,
        category: 'Assets',
        estimatedTime: '7m',
        playbook: {
            summary: "Insurance transfers risk from you to a company. You pay a 'Premium' to avoid a catastrophic 'Loss'.",
            realLifeExample: "You pay $100/mo for car insurance. You crash ($10k damage). You pay $500 deductible, they pay $9,500.",
            definitions: [
                { term: "Premium", definition: "Monthly cost of insurance." },
                { term: "Deductible", definition: "What you pay before insurance kicks in." }
            ],
            actionableSteps: ["Check if you have renters/homeowners insurance.", "Shop rates yearly."]
        },
        steps: [
            { id: '24-1', type: 'info', content: 'High Deductible = Low Premium. Low Deductible = High Premium.' },
            { id: '24-2', type: 'connections', content: 'Match the Insurance to the Risk.', connectionPairs: [{ term: 'Health', match: 'Hospital Bills' }, { term: 'Auto', match: 'Car Crash' }, { term: 'Life', match: 'Death of earner' }] },
            { id: '24-3', type: 'sorting', content: 'Order steps of a claim.', sortCorrectOrder: ['Accident Happens', 'File Claim', 'Pay Deductible', 'Insurer Pays Rest'] }
        ]
    },
    {
        id: 'unit-25',
        title: 'The Founder',
        description: 'Basics of starting a business.',
        xpReward: 500,
        isCompleted: false,
        category: 'Business',
        estimatedTime: '8m',
        playbook: {
            summary: "Business is solving problems for profit. Revenue - Expenses = Profit.",
            realLifeExample: "Lemonade Stand. Lemons/Sugar ($20) + Cup Cost ($5) = Expenses. Sales ($100) = Revenue. Profit = $75.",
            definitions: [
                { term: "Revenue", definition: "Total money coming in." },
                { term: "Profit", definition: "Money left after bills." },
                { term: "Margin", definition: "Percentage of profit per sale." }
            ],
            actionableSteps: ["Identify a problem people pay to solve.", "Start small (MVP)."]
        },
        steps: [
            { id: '25-1', type: 'info', content: 'Revenue is vanity. Profit is sanity. Cash flow is reality.' },
            {
                id: '25-2', type: 'question', content: 'What is "Bootstrapping"?', options: [
                    { id: 'a', text: 'Wearing boots', isCorrect: false, feedback: 'Fashionable, but no.' },
                    { id: 'b', text: 'Funding it yourself', isCorrect: true, feedback: 'Correct. Growing without outside investors.' },
                    { id: 'c', text: 'Getting a loan', isCorrect: false, feedback: 'That is debt financing.' }
                ]
            },
            { id: '25-3', type: 'connections', content: 'Match the role.', connectionPairs: [{ term: 'CEO', match: 'Vision' }, { term: 'CFO', match: 'Money' }, { term: 'CTO', match: 'Tech' }] }
        ]
    },
    {
        id: 'unit-26',
        title: 'Budget Architect',
        description: 'Design the perfect budget.',
        xpReward: 1200,
        isCompleted: false,
        category: 'Basics',
        estimatedTime: '8m',
        playbook: {
            summary: "Budgeting is balancing. Use the 50/30/20 rule to keep your life stable while building wealth.",
            realLifeExample: "On a $4000 income: $2000 for needs, $1200 for fun, $800 for future you.",
            definitions: [
                { term: "Allocation", definition: "Assigning money to specific jobs." },
                { term: "Zero-Based", definition: "Every dollar has a purpose." }
            ],
            actionableSteps: ["Check your last month's spending ratios."]
        },
        steps: [
            { id: '26-1', type: 'info', content: 'Let\'s practice the 50/30/20 Rule. You are the architect of your paycheck.' },
            {
                id: '26-2',
                type: 'slider-allocator',
                content: 'Allocate your paycheck to hit the 50/30/20 balance.',
                allocatorCategories: [
                    { label: 'Needs (Rent/Food)', targetPercent: 50, startPercent: 20 },
                    { label: 'Wants (Fun/Travel)', targetPercent: 30, startPercent: 60 },
                    { label: 'Savings (Investing)', targetPercent: 20, startPercent: 20 }
                ],
                correctAnswerExplanation: 'Perfect balance! 50% for Needs covers survival. 30% for Wants keeps you happy. 20% for Savings builds your freedom.'
            },
            {
                id: '26-3',
                type: 'slider-allocator',
                content: 'Aggressive Saving Mode (FIRE): Adjust for a 50% Savings Rate!',
                allocatorCategories: [
                    { label: 'Needs', targetPercent: 40, startPercent: 50 },
                    { label: 'Wants', targetPercent: 10, startPercent: 40 },
                    { label: 'Savings', targetPercent: 50, startPercent: 10 }
                ],
                correctAnswerExplanation: 'Hardcore! To save 50%, you usually have to cut Wants drastically and keep Needs low. This is how you retire in 10 years.'
            }
        ]
    },
    {
        id: 'unit-27',
        title: 'Red Flag Hunter',
        description: 'Spot the scam before you click.',
        xpReward: 1200,
        isCompleted: false,
        category: 'Basics',
        estimatedTime: '8m',
        playbook: {
            summary: "Scammers use urgency and fear. Learn to spot the keywords they hide in plain sight.",
            realLifeExample: "Emails claiming 'Account Suspended' are usually fake. Check the sender address.",
            definitions: [
                { term: "Phishing", definition: "Fake messages luring you to click." },
                { term: "Spoofing", definition: "Faking a phone number or email." }
            ],
            actionableSteps: ["Hover over links before clicking.", "Never send crypto to 'verify' a wallet."]
        },
        steps: [
            { id: '27-1', type: 'info', content: 'Scammers are smart, but they use the same words over and over. Learn to hunt the Red Flags.' },
            {
                id: '27-2',
                type: 'text-selector',
                content: 'URGENT: Your account has been suspended. Click here to reset your password immediately.',
                hint: 'Tap the 3 suspicious words in this text message.',
                selectorTargetPhrases: ['URGENT', 'suspended', 'password'],
                correctAnswerExplanation: 'Banks never text you "URGENT", they don\'t say your account is "suspended" via SMS, and they NEVER ask for your "password".'
            },
            {
                id: '27-3',
                type: 'text-selector',
                content: 'Earn $500 daily with No Experience. We will send you a check to buy equipment.',
                hint: 'Analyze this "Job Offer" email. Find the 3 lies.',
                selectorTargetPhrases: ['daily', 'No Experience', 'check'],
                correctAnswerExplanation: 'Making $500 "daily" with "No Experience" is a lie. Sending you a "check" to buy equipment is a classic fake check scam.'
            }
        ]
    },
    {
        id: 'unit-28',
        title: 'Rapid Fire: Assets',
        description: 'Think fast. Wealthy or Broke?',
        xpReward: 1500,
        isCompleted: false,
        category: 'Basics',
        estimatedTime: '3m',
        playbook: {
            summary: "Speed matters. You need to be able to identify an asset vs a liability instantly.",
            realLifeExample: "A boat? Liability (Maintenance, Gas). A boat rental business? Asset (Income).",
            definitions: [
                { term: "Depreciation", definition: "Decrease in value over time." },
                { term: "Cash Flow", definition: "The net amount of cash moving in and out." }
            ],
            actionableSteps: ["Look at everything you own. Is it an asset or liability?"]
        },
        steps: [
            { id: '28-1', type: 'info', content: 'Welcome to the Speed Round. You have to decide instantly: Asset (Puts money in pocket) or Liability (Takes money out).' },
            {
                id: '28-2', type: 'binary-choice', content: 'A Brand New Luxury Car',
                binaryLeft: { label: 'Asset', isCorrect: false, feedback: 'Nope. Cars depreciate instantly.' },
                binaryRight: { label: 'Liability', isCorrect: true, feedback: 'Correct! Gas, insurance, and value drop.' }
            },
            {
                id: '28-3', type: 'binary-choice', content: 'Rental Property',
                binaryLeft: { label: 'Asset', isCorrect: true, feedback: 'Yes! Tenants pay you rent.' },
                binaryRight: { label: 'Liability', isCorrect: false, feedback: 'Only if it is empty. Usually, it is an asset.' }
            },
            {
                id: '28-4', type: 'binary-choice', content: 'A Designer Watch',
                binaryLeft: { label: 'Asset', isCorrect: false, feedback: 'Rarely. Most watches lose value.' },
                binaryRight: { label: 'Liability', isCorrect: true, feedback: 'Correct. It does not pay you to own it.' }
            },
            {
                id: '28-5', type: 'binary-choice', content: 'Dividend Stocks',
                binaryLeft: { label: 'Asset', isCorrect: true, feedback: 'Bingo. You get paid quarterly just for owning them.' },
                binaryRight: { label: 'Liability', isCorrect: false, feedback: 'Incorrect. This is a classic asset.' }
            }
        ]
    },
    {
        id: 'unit-29',
        title: 'The Fine Print',
        description: 'Find the traps in the contract.',
        xpReward: 1500,
        isCompleted: false,
        category: 'Credit',
        estimatedTime: '7m',
        playbook: {
            summary: "The devil is in the details. Contracts are designed to protect the lender, not you.",
            realLifeExample: "0% APR for 12 months... but if you miss one payment, they charge you 25% interest back to Day 1.",
            definitions: [
                { term: "Terms and Conditions", definition: "The rules you agree to." },
                { term: "Default", definition: "Failure to repay a loan." }
            ],
            actionableSteps: ["Read the last contract you signed."]
        },
        steps: [
            { id: '29-1', type: 'info', content: 'Predatory lenders hide their traps in the fine print. Let\'s analyze a "Payday Loan" contract.' },
            {
                id: '29-2',
                type: 'text-selector',
                content: 'This loan has a 400% APR. Failure to pay allows wage garnishment and we may call your contacts.',
                hint: 'Tap the 3 dangerous terms in this loan agreement.',
                selectorTargetPhrases: ['400%', 'wage garnishment', 'contacts'],
                correctAnswerExplanation: 'A "400%" APR is a debt trap. "Wage garnishment" means they take money from your paycheck. Accessing your "contacts" means they will harass your friends.'
            }
        ]
    },
    {
        id: 'unit-30',
        title: 'Risk Profiler',
        description: 'How to invest at 25 vs 65.',
        xpReward: 1500,
        isCompleted: false,
        category: 'Investing',
        estimatedTime: '6m',
        playbook: {
            summary: "Risk capacity changes with age. When young, take risks. When old, preserve capital.",
            realLifeExample: "At 20, a market crash is a buying opportunity. At 70, it's a crisis.",
            definitions: [
                { term: "Risk Tolerance", definition: "How much loss you can handle emotionally." },
                { term: "Time Horizon", definition: "How long you plan to hold an investment." }
            ],
            actionableSteps: ["Determine your risk profile."]
        },
        steps: [
            { id: '30-1', type: 'info', content: 'Your investment strategy should change as you age. Young = Growth (Risk). Old = Preservation (Safe).' },
            {
                id: '30-2',
                type: 'slider-allocator',
                content: 'You are 25 years old. Build a portfolio for MAXIMUM GROWTH.',
                allocatorCategories: [
                    { label: 'Stocks (Risky/High Reward)', targetPercent: 90, startPercent: 50 },
                    { label: 'Bonds (Safe/Low Reward)', targetPercent: 10, startPercent: 50 }
                ],
                correctAnswerExplanation: 'At 25, you have decades to recover from crashes, so you should own mostly stocks for growth.'
            },
            {
                id: '30-3',
                type: 'slider-allocator',
                content: 'You are 65 and retiring. Build a portfolio for SAFETY.',
                allocatorCategories: [
                    { label: 'Stocks', targetPercent: 40, startPercent: 50 },
                    { label: 'Bonds/Cash', targetPercent: 60, startPercent: 50 }
                ],
                correctAnswerExplanation: 'At 65, you cannot afford a 50% crash. You need more bonds and cash to pay your bills safely.'
            }
        ]
    },
    // NEW UNIT 31: CARD SWIPE (NEW GAME)
    {
        id: 'unit-31',
        title: 'Swipe Right on Wealth',
        description: 'Make split-second financial decisions.',
        xpReward: 1500,
        isCompleted: false,
        category: 'Investing',
        estimatedTime: '6m',
        playbook: {
            summary: "Investing is emotional. The market tests your discipline every day. Master your emotions, master your money.",
            realLifeExample: "Selling when the market drops 10% feels safe, but it locks in a loss. Holding usually leads to recovery.",
            definitions: [
                { term: "FOMO", definition: "Fear Of Missing Out. Buying because everyone else is." },
                { term: "Panic Selling", definition: "Selling assets because of fear, usually at a loss." }
            ],
            actionableSteps: ["Create an 'Investment Policy Statement' for yourself."]
        },
        steps: [
            { id: '31-1', type: 'info', content: 'The stock market is a device for transferring money from the impatient to the patient.' },
            { id: '31-2', type: 'connections', content: 'Match the Emotion to the Action.', connectionPairs: [{ term: 'FOMO', match: 'Buying at the Top' }, { term: 'Panic', match: 'Selling at the Bottom' }, { term: 'Discipline', match: 'Holding during crash' }] },
            {
                id: '31-3',
                type: 'binary-choice',
                content: 'Market crashes 20% tomorrow. What do you do?',
                binaryLeft: { label: 'Sell Everything', isCorrect: false, feedback: 'You just locked in your losses. Bad move.' },
                binaryRight: { label: 'Do Nothing / Buy', isCorrect: true, feedback: 'Correct. Stocks are on sale.' }
            }
        ]
    },
    // NEW UNIT 32: SIDE HUSTLE (BINARY CHOICE)
    {
        id: 'unit-32',
        title: 'Side Hustle Hustler',
        description: 'Active vs Passive Income.',
        xpReward: 1500,
        isCompleted: false,
        category: 'Business',
        estimatedTime: '5m',
        playbook: {
            summary: "Active income requires your time. Passive income requires your money (or upfront effort). Aim for passive.",
            realLifeExample: "Active: Driving Uber. Passive: Selling a stock photo online that people download for years.",
            definitions: [
                { term: "Passive Income", definition: "Earnings derived from an enterprise in which a person is not actively involved." },
                { term: "Scalability", definition: "The ability to handle a growing amount of work without adding resources." }
            ],
            actionableSteps: ["Brainstorm one passive income idea."]
        },
        steps: [
            { id: '32-1', type: 'info', content: 'Not all income is created equal. Active means you work for it. Passive means it works for you.' },
            {
                id: '32-2', type: 'binary-choice', content: 'Driving for Uber',
                binaryLeft: { label: 'Active Income', isCorrect: true, feedback: 'Correct. No drive = No pay.' },
                binaryRight: { label: 'Passive Income', isCorrect: false, feedback: 'Wrong. You have to be there to earn.' }
            },
            {
                id: '32-3', type: 'binary-choice', content: 'Selling a Digital Course',
                binaryLeft: { label: 'Active Income', isCorrect: false, feedback: 'Nope. You make it once, sell it forever.' },
                binaryRight: { label: 'Passive Income', isCorrect: true, feedback: 'Bingo. Build once, sell twice.' }
            },
            {
                id: '32-4', type: 'binary-choice', content: 'Dividend Stocks',
                binaryLeft: { label: 'Active Income', isCorrect: false, feedback: 'Incorrect. You do nothing but hold.' },
                binaryRight: { label: 'Passive Income', isCorrect: true, feedback: 'Yes! Money while you sleep.' }
            }
        ]
    },
    // NEW UNIT 33: CREDIT HACKER (TEXT SELECTOR)
    {
        id: 'unit-33',
        title: 'Credit Score Hacker',
        description: 'Boost your score fast.',
        xpReward: 1500,
        isCompleted: false,
        category: 'Credit',
        estimatedTime: '6m',
        playbook: {
            summary: "Your credit score is your adult report card. 35% is Payment History, 30% is Utilization.",
            realLifeExample: "Paying off a maxed-out card can boost your score by 50+ points in a month.",
            definitions: [
                { term: "Utilization", definition: "Percentage of credit limit you are using." },
                { term: "Hard Inquiry", definition: "When a lender checks your credit (drops score slightly)." }
            ],
            actionableSteps: ["Keep utilization under 30%.", "Never miss a payment."]
        },
        steps: [
            { id: '33-1', type: 'info', content: 'Want a higher score? Attack the factors that matter most.' },
            {
                id: '33-2',
                type: 'text-selector',
                content: 'I am Maxing out cards and Applying for 5 loans to get more cash.',
                hint: 'Tap the 2 actions that HURT your credit score.',
                selectorTargetPhrases: ['Maxing out cards', 'Applying for 5 loans'],
                correctAnswerExplanation: 'Maxing out cards spikes your utilization. Applying for too many loans looks desperate (Hard Inquiries).'
            }
        ]
    },
    // NEW UNIT 34: CRYPTO & WEB3 (CARD SWIPE)
    {
        id: 'unit-34',
        title: 'Crypto Casino',
        description: 'High risk, high reward?',
        xpReward: 2000,
        isCompleted: false,
        category: 'Investing',
        estimatedTime: '5m',
        playbook: {
            summary: "Crypto is the Wild West. High rewards come with extreme risks. Never bet the farm.",
            realLifeExample: "FTX collapsed overnight. People lost millions. Not your keys, not your coins.",
            definitions: [
                { term: "Cold Storage", definition: "Storing crypto offline to prevent hacking." },
                { term: "Seed Phrase", definition: "A list of words that grant access to your crypto wallet." }
            ],
            actionableSteps: ["If you own crypto, move it to a self-custody wallet."]
        },
        steps: [
            { id: '34-1', type: 'info', content: 'Crypto is volatile. It is not savings, it is speculation. Only bet what you can lose.' },
            {
                id: '34-2', type: 'card-swipe', content: 'Investing your Emergency Fund in Dogecoin',
                binaryLeft: { label: 'Bad Idea', isCorrect: true, feedback: 'Correct. Never gamble your safety net.' },
                binaryRight: { label: 'Good Idea', isCorrect: false, feedback: 'Are you crazy? Much wow, much broke.' }
            },
            {
                id: '34-3', type: 'card-swipe', content: 'Buying Bitcoin and holding for 10 years',
                binaryLeft: { label: 'Bad Idea', isCorrect: false, feedback: 'Debatable, but historically a good long-term play.' },
                binaryRight: { label: 'Good Idea', isCorrect: true, feedback: 'HODL. Long time horizon reduces risk.' }
            },
            {
                id: '34-4', type: 'card-swipe', content: 'Giving your seed phrase to "Tech Support"',
                binaryLeft: { label: 'Bad Idea', isCorrect: true, feedback: 'Smart. Never share your keys.' },
                binaryRight: { label: 'Good Idea', isCorrect: false, feedback: 'And... your wallet is drained.' }
            }
        ]
    },
    // NEW UNIT 35: REAL ESTATE TYCOON (CONNECTIONS)
    {
        id: 'unit-35',
        title: 'Real Estate Tycoon',
        description: 'Landlords vs REITs.',
        xpReward: 1800,
        isCompleted: false,
        category: 'Assets',
        estimatedTime: '7m',
        playbook: {
            summary: "Real estate uses leverage (debt) to amplify returns. You put 20% down, but get 100% of the appreciation.",
            realLifeExample: "You buy a $100k house with $20k down. It goes up 10% to $110k. You made $10k on a $20k investment (50% return).",
            definitions: [
                { term: "Leverage", definition: "Using borrowed capital for (an investment), expecting the profits made to be greater than the interest payable." },
                { term: "REIT", definition: "Real Estate Investment Trust." }
            ],
            actionableSteps: ["Look at Zillow for properties in your area."]
        },
        steps: [
            { id: '35-1', type: 'info', content: 'You do not need to buy a house to invest in real estate. REITs let you own pieces of malls and apartments.' },
            { id: '35-2', type: 'connections', content: 'Match the Real Estate term.', connectionPairs: [{ term: 'REIT', match: 'Stock Market Real Estate' }, { term: 'Mortgage', match: 'House Loan' }, { term: 'Equity', match: 'Ownership Value' }] },
            { id: '35-3', type: 'question', content: 'What is the "BRRRR" method?', options: [{ id: 'a', text: 'Being cold', isCorrect: false, feedback: 'Put on a sweater.' }, { id: 'b', text: 'Buy, Rehab, Rent, Refinance, Repeat', isCorrect: true, feedback: 'The landlord infinite money glitch.' }] }
        ]
    },
    // NEW UNIT 36: TAX AVOIDANCE (LEGAL) (SLIDER ALLOCATOR)
    {
        id: 'unit-36',
        title: 'Tax Ninja',
        description: 'Keep more of what you earn.',
        xpReward: 2000,
        isCompleted: false,
        category: 'Advanced',
        estimatedTime: '8m',
        playbook: {
            summary: "Tax Evasion is illegal. Tax Avoidance is smart. Use tax-advantaged accounts like 401k and IRA.",
            realLifeExample: "Putting $6000 in a Traditional IRA reduces your taxable income by $6000 instantly.",
            definitions: [
                { term: "Pre-Tax", definition: "Money invested before taxes are taken out (401k)." },
                { term: "Post-Tax", definition: "Money invested after taxes (Roth IRA)." }
            ],
            actionableSteps: ["Open a Roth IRA.", "Max out employer 401k match."]
        },
        steps: [
            { id: '36-1', type: 'info', content: 'The government takes a cut. Your job is to make that cut smaller legally.' },
            {
                id: '36-2',
                type: 'slider-allocator',
                content: 'Allocate your $10,000 bonus to minimize taxes.',
                allocatorCategories: [
                    { label: 'Traditional 401k (Tax Deduction)', targetPercent: 60, startPercent: 20 },
                    { label: 'Checking Account (Taxed Fully)', targetPercent: 40, startPercent: 80 }
                ],
                correctAnswerExplanation: 'Putting more in the 401k lowers your tax bill now. The Checking Account money gets taxed at your highest rate.'
            }
        ]
    },
    // NEW UNIT 37: MILLIONAIRE MINDSET (BINARY CHOICE)
    {
        id: 'unit-37',
        title: 'Millionaire Mindset',
        description: 'Rich vs Poor thinking.',
        xpReward: 1500,
        isCompleted: false,
        category: 'Basics',
        estimatedTime: '5m',
        playbook: {
            summary: "Rich people buy assets. Poor people buy liabilities. It's not about how much you make, it's what you buy.",
            realLifeExample: "A millionaire drives a 5-year-old Toyota and owns apartments. A 'fake rich' person drives a leased BMW and rents.",
            definitions: [
                { term: "Mindset", definition: "The established set of attitudes held by someone." },
                { term: "Delayed Gratification", definition: "Resisting an impulse to take an immediately available reward in the hope of obtaining a more valued reward in the future." }
            ],
            actionableSteps: ["Read 'The Millionaire Next Door'."]
        },
        steps: [
            { id: '37-1', type: 'info', content: 'Wealth is a mindset before it is a number.' },
            {
                id: '37-2', type: 'binary-choice', content: 'Buying a new iPhone every year',
                binaryLeft: { label: 'Rich Mindset', isCorrect: false, feedback: 'No. That is consumerism.' },
                binaryRight: { label: 'Poor Mindset', isCorrect: true, feedback: 'Correct. Staying broke to look rich.' }
            },
            {
                id: '37-3', type: 'binary-choice', content: 'Reading books on finance',
                binaryLeft: { label: 'Rich Mindset', isCorrect: true, feedback: 'Yes. Knowledge is the best asset.' },
                binaryRight: { label: 'Poor Mindset', isCorrect: false, feedback: 'Wrong. Leaders are readers.' }
            }
        ]
    },
    // NEW UNIT 38: NEGOTIATION JEDI (SCENARIO)
    {
        id: 'unit-38',
        title: 'Negotiation Jedi',
        description: 'Get paid what you are worth.',
        xpReward: 1800,
        isCompleted: false,
        category: 'Business',
        estimatedTime: '7m',
        playbook: {
            summary: "In business, you don't get what you deserve, you get what you negotiate. Always ask for more.",
            realLifeExample: "Negotiating a $5k raise every 3 years adds up to over $100k in extra earnings over a career.",
            definitions: [
                { term: "BATNA", definition: "Best Alternative to a Negotiated Agreement." },
                { term: "Anchoring", definition: "The tendency to rely too heavily on the first piece of information offered." }
            ],
            actionableSteps: ["Practice negotiating on a small purchase (like a mattress or car)."]
        },
        steps: [
            { id: '38-1', type: 'info', content: 'You don\'t get what you deserve, you get what you negotiate.' },
            {
                id: '38-2', type: 'scenario', content: 'Boss offers $50k. You want $60k. You say...', scenarioOptions: [
                    { text: 'Okay, thanks!', isCorrect: false, feedback: 'You just left $10k on the table.' },
                    { text: 'I need $60k because I have bills.', isCorrect: false, feedback: 'They do not care about your bills.' },
                    { text: 'Based on my market value and results, $60k is appropriate.', isCorrect: true, feedback: 'Correct. Use data, not emotion.' }
                ]
            }
        ]
    },
    // NEW UNIT 39: ECONOMIC CYCLES (PUZZLE)
    {
        id: 'unit-39',
        title: 'Recession Proof',
        description: 'Survive the crash.',
        xpReward: 1500,
        isCompleted: false,
        category: 'Advanced',
        estimatedTime: '6m',
        playbook: {
            summary: "Recessions are part of the economic cycle. They are scary, but they are also the best time to build wealth.",
            realLifeExample: "During the 2008 recession, houses and stocks were 50% off. Those who bought then are rich now.",
            definitions: [
                { term: "Recession", definition: "A period of temporary economic decline." },
                { term: "Emergency Fund", definition: "Cash saved for unexpected expenses." }
            ],
            actionableSteps: ["Increase your emergency fund to 6 months."]
        },
        steps: [
            { id: '39-1', type: 'info', content: 'Economies go up and down. Winter is coming. Be ready.' },
            { id: '39-2', type: 'puzzle', content: 'Unscramble: The R-Word.', scramble: 'CESSIREON', puzzleWord: 'RECESSION', hint: 'When the economy shrinks.' },
            { id: '39-3', type: 'question', content: 'Cash is ___ during a crash.', options: [{ id: 'a', text: 'Trash', isCorrect: false, feedback: 'No, you need liquidity.' }, { id: 'b', text: 'King', isCorrect: true, feedback: 'Correct. Cash lets you buy cheap assets.' }] }
        ]
    },
    // NEW UNIT 40: FINANCIAL FREEDOM (SLIDER ALLOCATOR)
    {
        id: 'unit-40',
        title: 'The 4% Rule',
        description: 'When can you quit?',
        xpReward: 2500,
        isCompleted: false,
        category: 'Advanced',
        estimatedTime: '8m',
        playbook: {
            summary: "The 4% Rule says you can safely withdraw 4% of your portfolio every year forever. To spend $40k/year, you need $1 Million.",
            realLifeExample: "$1,000,000 x 0.04 = $40,000/year passive income.",
            definitions: [
                { term: "FIRE", definition: "Financial Independence, Retire Early." },
                { term: "Safe Withdrawal Rate", definition: "The % you can take out without running out of money." }
            ],
            actionableSteps: ["Calculate your FIRE number: Annual Expenses x 25."]
        },
        steps: [
            { id: '40-1', type: 'info', content: 'The math of freedom is simple. Annual Spend x 25 = Freedom Number.' },
            {
                id: '40-2',
                type: 'slider-allocator',
                content: 'You spend $40,000 a year. How much do you need to retire?',
                allocatorCategories: [
                    { label: 'Portfolio Value', targetPercent: 100, startPercent: 10 } // Represents $1M
                ],
                correctAnswerExplanation: 'You need $1,000,000. Because 4% of $1M is $40,000. Now get to work!'
            }
        ]
    },
    // NEW UNIT 41: VENTURE CAPITAL
    {
        id: 'unit-41',
        title: 'Venture Capital',
        description: 'High risk, massive reward.',
        xpReward: 3000,
        isCompleted: false,
        category: 'Mastery',
        estimatedTime: '10m',
        playbook: {
            summary: "VCs invest in early-stage startups. Most fail, but one 'unicorn' pays for all the losses.",
            realLifeExample: "Investing $10k in Uber's seed round would be worth $100M+ today.",
            definitions: [
                { term: "Seed Round", definition: "The first official equity funding stage." },
                { term: "Dilution", definition: "Reduction in ownership percentage as new shares are issued." }
            ],
            actionableSteps: ["Research equity crowdfunding platforms."]
        },
        steps: [
            { id: '41-1', type: 'info', content: 'Venture Capital is about power laws. One winner returns 100x, covering 99 losers.' },
            {
                id: '41-2', type: 'binary-choice', content: 'Safe 10% return vs 1% chance of 1000x return',
                binaryLeft: { label: 'Safe Play', isCorrect: false, feedback: 'That is investing, not VC.' },
                binaryRight: { label: 'VC Play', isCorrect: true, feedback: 'Correct. You are hunting unicorns.' }
            }
        ]
    },
    // NEW UNIT 42: GLOBAL ECONOMICS
    {
        id: 'unit-42',
        title: 'Global Macro',
        description: 'How the world works.',
        xpReward: 3000,
        isCompleted: false,
        category: 'Mastery',
        estimatedTime: '12m',
        playbook: {
            summary: "Currencies, interest rates, and geopolitics move markets. Everything is connected.",
            realLifeExample: "When the US raises interest rates, money flows out of emerging markets into the Dollar.",
            definitions: [
                { term: "Forex", definition: "Foreign Exchange Market." },
                { term: "GDP", definition: "Gross Domestic Product - total value of goods produced." }
            ],
            actionableSteps: ["Read the Financial Times or WSJ."]
        },
        steps: [
            { id: '42-1', type: 'info', content: 'Money flows to where it is treated best. High interest rates attract capital.' },
            {
                id: '42-2', type: 'connections', content: 'Connect the Cause and Effect.',
                connectionPairs: [
                    { term: 'High Inflation', match: 'Raise Interest Rates' },
                    { term: 'Strong Dollar', match: 'Cheap Imports' },
                    { term: 'Weak Dollar', match: 'More Exports' }
                ]
            }
        ]
    },
    // NEW UNIT 43: BEHAVIORAL MASTERY
    {
        id: 'unit-43',
        title: 'Zen Investor',
        description: 'Mastering your mind.',
        xpReward: 3500,
        isCompleted: false,
        category: 'Mastery',
        estimatedTime: '15m',
        playbook: {
            summary: "The biggest risk to your wealth is looking in the mirror. Emotional discipline beats IQ.",
            realLifeExample: "Isaac Newton lost millions in the South Sea Bubble because he couldn't control his greed.",
            definitions: [
                { term: "Stoicism", definition: "Endurance of pain or hardship without the display of feelings." },
                { term: "Hindsight Bias", definition: "Believing past events were predictable." }
            ],
            actionableSteps: ["Meditate on your financial goals."]
        },
        steps: [
            { id: '43-1', type: 'info', content: 'If you cannot control your emotions, you cannot control your money.' },
            {
                id: '43-2', type: 'scenario', content: 'Your portfolio drops 50% in a crash. Everyone is panicking.',
                scenarioOptions: [
                    { text: 'Sell to save what is left.', isCorrect: false, feedback: 'You just crystallized a loss.' },
                    { text: 'Check the price every hour.', isCorrect: false, feedback: 'This causes anxiety and bad decisions.' },
                    { text: 'Do nothing. Stick to the plan.', isCorrect: true, feedback: 'The hardest and best thing to do.' }
                ]
            }
        ]
    },
    // NEW UNIT 44: LEGACY
    {
        id: 'unit-44',
        title: 'The Dynasty',
        description: 'Building generational wealth.',
        xpReward: 5000,
        isCompleted: false,
        category: 'Mastery',
        estimatedTime: '20m',
        playbook: {
            summary: "True wealth is what you leave behind. Trusts, wills, and values matter more than money.",
            realLifeExample: "The Rockefellers built a system to pass down wealth and values for generations.",
            definitions: [
                { term: "Trust", definition: "A legal entity to hold assets for beneficiaries." },
                { term: "Estate Tax", definition: "Tax on the transfer of property at death." }
            ],
            actionableSteps: ["Create a Will."]
        },
        steps: [
            { id: '44-1', type: 'info', content: 'You can\'t take it with you. But you can decide where it goes.' },
            {
                id: '44-2', type: 'question', content: 'What is the best way to protect assets for your kids?',
                options: [
                    { id: 'a', text: 'Give them cash now', isCorrect: false, feedback: 'They might spend it all.' },
                    { id: 'b', text: 'Put it in a Trust', isCorrect: true, feedback: 'Correct. You control the rules even after you are gone.' }
                ]
            }
        ]
    }
];

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
                <div className="flex items-center gap-3 w-full md:w-auto justify-end bg-white">
                    <div className="relative h-full">
                        <button onClick={() => setShowRegionMenu(!showRegionMenu)} className="flex items-center gap-2 bg-ink text-white px-4 py-2 border-2 border-ink font-black uppercase text-xs tracking-wider hover:bg-gray-800 h-full shadow-sm">
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

                    <button onClick={() => setShowPlaybook(true)} className="flex items-center gap-2 px-4 py-2 bg-banky-blue text-white border-2 border-ink font-black uppercase shadow-sm hover:shadow-neo-sm transition-all text-xs md:text-sm"><Book className="w-4 h-4" /> Playbook</button>
                    <button onClick={() => setShowInventory(true)} className="flex items-center gap-2 px-4 py-2 bg-banky-pink border-2 border-ink font-black uppercase shadow-sm hover:shadow-neo-sm transition-all text-xs md:text-sm"><Package className="w-4 h-4" /> Loot</button>
                </div>
            </div>

            {/* RESPONSIVE MAP CONTAINER */}
            <div className="relative w-full max-w-md mx-auto mt-20 md:mt-40 pb-32 animate-fade-in select-none">
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
