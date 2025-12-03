import { EducationModule } from '../types';

export const BASE_MODULES: EducationModule[] = [
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
                    { label: 'Needs', targetPercent: 50, startPercent: 20 },
                    { label: 'Wants', targetPercent: 30, startPercent: 60 },
                    { label: 'Savings', targetPercent: 20, startPercent: 20 }
                ],
                correctAnswerExplanation: 'Hardcore! To save 50%, you usually have to cut Wants drastically and keep Needs low. This is how you retire in 10 years.'
            }
        ]
    },
    // --- ADVENTURE LEVELS ---
    {
        id: 'adv-1',
        title: 'The Digital Nomad',
        description: 'Work from anywhere, earn everywhere.',
        xpReward: 600,
        isCompleted: false,
        category: 'Adventure',
        estimatedTime: '10m',
        playbook: {
            summary: "The world is your office. Geo-arbitrage allows you to earn in strong currencies (USD/EUR) and spend in weaker ones.",
            realLifeExample: "Earning $3000/mo in NYC is struggling. Earning $3000/mo in Bali is luxury living.",
            definitions: [
                { term: "Geo-Arbitrage", definition: "Leveraging cost of living differences between countries." },
                { term: "Tax Residency", definition: "Where you legally owe taxes." }
            ],
            actionableSteps: ["Research 'Digital Nomad Visas'.", "Check cost of living on NomadList."]
        },
        steps: [
            { id: 'adv-1-1', type: 'info', content: 'Welcome to the Digital Nomad lifestyle. Your goal: Earn Dollars, Spend Pesos.' },
            { id: 'adv-1-2', type: 'sorting', content: 'Pack your bag (Priorities).', sortCorrectOrder: ['Laptop', 'Passport', 'Travel Insurance', 'Swimsuit'] },
            {
                id: 'adv-1-3', type: 'scenario', content: 'You get sick in Thailand. What saves you?', scenarioOptions: [
                    { text: 'GoFundMe', isCorrect: false, feedback: 'Hope is not a strategy.' },
                    { text: 'Travel Insurance', isCorrect: true, feedback: 'Correct. SafetyWing or WorldNomads covers medical emergencies.' }
                ]
            }
        ]
    },
    {
        id: 'adv-2',
        title: 'The Startup Founder',
        description: 'From garage to IPO.',
        xpReward: 800,
        isCompleted: false,
        category: 'Adventure',
        estimatedTime: '12m',
        playbook: {
            summary: "Startups are high growth, high risk. You are building a machine that prints money.",
            realLifeExample: "Airbnb started by selling cereal boxes. Now it's worth billions.",
            definitions: [
                { term: "MVP", definition: "Minimum Viable Product. The simplest version of your idea." },
                { term: "Pivot", definition: "Changing strategy when the current one fails." }
            ],
            actionableSteps: ["Validate your idea with 10 customers."]
        },
        steps: [
            { id: 'adv-2-1', type: 'info', content: 'You have a billion dollar idea. But ideas are cheap. Execution is everything.' },
            { id: 'adv-2-2', type: 'fill-blank', content: 'Build a [BLANK] to test your idea fast.', fillBlankCorrect: 'MVP', fillBlankOptions: ['MVP', 'Logo', 'Office'] },
            {
                id: 'adv-2-3', type: 'binary-choice', content: 'Investor offers $100k for 50% of your company.', binaryLeft: { label: 'Accept', isCorrect: false, feedback: 'Bad deal! You gave away control too early.' }, binaryRight: { label: 'Reject', isCorrect: true, feedback: 'Smart. Bootstrapping is better early on.' }
            }
        ]
    },
    // --- SIDE QUESTS ---
    {
        id: 'sq-1',
        title: 'The Coffee Factor',
        description: 'Small leaks sink great ships.',
        xpReward: 150,
        isCompleted: false,
        category: 'Basics',
        isSideQuest: true,
        estimatedTime: '3m',
        playbook: {
            summary: "It's not just coffee. It's the habit of unconscious spending.",
            realLifeExample: "$5 coffee x 365 days = $1,825. Invested at 8% for 10 years = $27,000.",
            definitions: [],
            actionableSteps: ["Make coffee at home for a week."]
        },
        steps: [
            { id: 'sq-1-1', type: 'info', content: 'Side Quest: Stop the daily drain.' },
            { id: 'sq-1-2', type: 'question', content: 'Is a $5 coffee bad?', options: [{ id: 'a', text: 'Yes, always', isCorrect: false, feedback: 'No, enjoy life. But be conscious.' }, { id: 'b', text: 'Only if you can\'t afford it', isCorrect: true, feedback: 'Correct. If you have debt, that coffee is costing you $20.' }] }
        ]
    },
    {
        id: 'sq-2',
        title: 'The Used Car Lot',
        description: 'Negotiate like a pro.',
        xpReward: 200,
        isCompleted: false,
        category: 'Assets',
        isSideQuest: true,
        estimatedTime: '5m',
        playbook: {
            summary: "Cars depreciate. Let someone else take the hit.",
            realLifeExample: "New car loses 20% value the moment you drive off the lot.",
            definitions: [],
            actionableSteps: ["Check Kelley Blue Book values."]
        },
        steps: [
            { id: 'sq-2-1', type: 'info', content: 'Side Quest: Don\'t get ripped off.' },
            { id: 'sq-2-2', type: 'binary-choice', content: 'Dealer says: "What monthly payment do you want?"', binaryLeft: { label: 'Tell them', isCorrect: false, feedback: 'Trap! They will extend the loan term to hide the high price.' }, binaryRight: { label: 'Focus on Total Price', isCorrect: true, feedback: 'Bingo. Negotiate the out-the-door price.' } }
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
            realLifeExample: "A text saying 'Your account is locked, click here' is a phishing scam to steal your password.",
            definitions: [
                { term: "Phishing", definition: "Fake emails/texts looking like real companies." },
                { term: "Social Engineering", definition: "Manipulating people into giving up confidential info." }
            ],
            actionableSteps: ["Enable 2-Factor Authentication (2FA) on everything."]
        },
        steps: [
            { id: '27-1', type: 'sorting', content: 'Sort into Safe vs Scam.', sortCorrectOrder: ['Bank App', 'Official Email', 'IG DM "Free Crypto"', 'WhatsApp "IRS Agent"'] },
            {
                id: '27-2', type: 'question', content: 'Your bank calls asking for your password. You...', options: [
                    { id: 'a', text: 'Give it to them', isCorrect: false, feedback: 'Banks NEVER ask for passwords. Never.' },
                    { id: 'b', text: 'Hang up and call the official number', isCorrect: true, feedback: 'Always verify the source.' }
                ]
            }
        ]
    }
];
