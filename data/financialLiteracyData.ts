export interface Resource {
    title: string;
    url: string;
    type: 'article' | 'video' | 'tool';
}

export interface Lesson {
    id: string;
    title: string;
    description?: string;
    duration: string; // e.g., "5 min read"
    content: string; // Markdown supported
    resources?: Resource[];
}

export interface Module {
    id: string;
    title: string;
    description: string;
    icon: string; // Lucide icon name
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Mastery';
    lessons: Lesson[];
}

export interface Category {
    id: string;
    title: string;
    description: string;
    modules: Module[];
}

export const financialLiteracyData: Category[] = [
    {
        id: 'foundations',
        title: 'Foundations (Student & Young Adult)',
        description: 'Master the basics of money management, budgeting, and building a strong financial future.',
        modules: [
            {
                id: 'money-mindset',
                title: 'Money Mindset & Basics',
                description: 'Understand your relationship with money and the fundamental rules of the game.',
                icon: 'Wallet',
                level: 'Beginner',
                lessons: [
                    {
                        id: 'needs-vs-wants',
                        title: 'Needs vs. Wants: The Psychology of Spending',
                        duration: '5 min read',
                        content: `
### The Psychology of Spending
Understanding the difference between needs and wants is the first step to financial freedom. It sounds simple, but marketing is designed to blur these lines.

#### Needs (The Essentials)
These are expenses required for survival and basic functioning in society.
*   **Housing:** Rent or mortgage.
*   **Utilities:** Electricity, water, heat.
*   **Food:** Groceries (not dining out).
*   **Transportation:** Getting to work/school.
*   **Healthcare:** Insurance and medications.

#### Wants (The Discretionary)
These are things that improve your quality of life but aren't strictly necessary.
*   **Dining Out:** Restaurants, coffee shops.
*   **Entertainment:** Streaming services, video games, concerts.
*   **Fashion:** Designer clothes, new sneakers.
*   **Travel:** Vacations and weekend trips.

#### The Gray Area
Some things fall in between. A smartphone is a need for most jobs, but the latest iPhone Pro Max is a want. A car is a need in many cities, but a luxury SUV is a want.

**Action Step:** Review your last month's bank statement. Label every expense as "Need" or "Want". You might be surprised.
                        `,
                        resources: [
                            { title: 'Consumer.gov: Managing Your Money', url: 'https://consumer.gov/managing-your-money', type: 'article' },
                            { title: 'Khan Academy: Needs vs. Wants', url: 'https://www.khanacademy.org/college-careers-more/personal-finance/pf-saving-and-budgeting/pf-budgeting/v/needs-vs-wants', type: 'video' }
                        ]
                    },
                    {
                        id: 'budgeting-101',
                        title: 'Budgeting 101: The 50/30/20 Rule',
                        duration: '7 min read',
                        content: `
### The 50/30/20 Rule
Senator Elizabeth Warren popularized this simple, effective budgeting method. It's perfect for beginners because it's flexible.

#### 50% Needs
Half of your after-tax income should go to essentials.
*   Rent/Mortgage
*   Groceries
*   Utilities
*   Minimum debt payments

#### 30% Wants
This is your "fun money".
*   Dining out
*   Hobbies
*   Shopping
*   Netflix/Spotify

#### 20% Savings & Debt Repayment
This is the most important category for your future.
*   Emergency fund contributions
*   Retirement investing (401k, IRA)
*   Extra debt payments (above minimums)

**Pro Tip:** If you live in a high-cost city, your "Needs" might be 60% or 70%. That's okay! Adjust the other categories accordingly (e.g., 70/20/10). The goal is to have a plan, not to be perfect.
                        `,
                        resources: [
                            { title: 'NerdWallet Budget Calculator', url: 'https://www.nerdwallet.com/article/finance/budget-calculator', type: 'tool' },
                            { title: 'Investopedia: 50/30/20 Rule', url: 'https://www.investopedia.com/ask/answers/022916/what-502030-budget-rule.asp', type: 'article' }
                        ]
                    },
                    {
                        id: 'banking-basics',
                        title: 'Banking Basics: Checking vs. Savings',
                        duration: '4 min read',
                        content: `
### Where to Keep Your Money
Not all bank accounts are created equal.

#### Checking Account
*   **Purpose:** Daily transactions.
*   **Features:** Debit card, checks, bill pay.
*   **Interest:** Usually 0% or very low.
*   **Tip:** Keep 1-2 months of expenses here to avoid overdrafts.

#### Savings Account
*   **Purpose:** Storing money for short-term goals (emergency fund, vacation).
*   **Features:** Limited withdrawals (usually 6/month).
*   **Interest:** Varies widely.
*   **High-Yield Savings Account (HYSA):** These are game-changers. Online banks often offer 4-5% APY (Annual Percentage Yield) compared to 0.01% at traditional big banks.

**Example:**
If you have $10,000 in savings:
*   **Big Bank (0.01%):** You earn $1/year.
*   **HYSA (5.00%):** You earn $500/year.
*   **Result:** Free money for doing nothing. Switch to a HYSA today.
                        `,
                        resources: [
                            { title: 'FDIC: BankFind Suite', url: 'https://banks.data.fdic.gov/bankfind-suite/bankfind', type: 'tool' },
                            { title: 'NerdWallet: Best High-Yield Savings Accounts', url: 'https://www.nerdwallet.com/best/banking/high-yield-online-savings-accounts', type: 'article' }
                        ]
                    },
                    {
                        id: 'compound-interest-power',
                        title: 'The Power of Compound Interest',
                        duration: '6 min read',
                        content: `
### The 8th Wonder of the World
Compound interest is when you earn interest on your interest. It's the secret sauce of building wealth.

#### The Formula
A = P(1 + r/n)^(nt)
*   Don't worry about the math. Just understand the concept: **Time is your best friend.**

#### Example: Jack vs. Jill
*   **Jack:** Invests $200/month from age 20 to 30, then stops. Total invested: $24,000.
*   **Jill:** Invests $200/month from age 30 to 60. Total invested: $72,000.

Assuming an 8% annual return:
*   **Jack at age 60:** ~$280,000
*   **Jill at age 60:** ~$270,000

**Jack wins**, even though he invested **3x less money**. Why? Because his money had 10 extra years to grow.

**Lesson:** Start investing now. Even $50/month makes a huge difference over 40 years.
                        `,
                        resources: [
                            { title: 'Investor.gov Compound Interest Calculator', url: 'https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator', type: 'tool' },
                            { title: 'Investopedia: Compound Interest', url: 'https://www.investopedia.com/terms/c/compoundinterest.asp', type: 'article' }
                        ]
                    }
                ]
            },
            {
                id: 'student-survival',
                title: 'Student Survival Guide',
                description: 'Hacks to survive college without going broke.',
                icon: 'GraduationCap',
                level: 'Beginner',
                lessons: [
                    {
                        id: 'textbooks-tech',
                        title: 'Textbooks & Tech: Save 90%',
                        duration: '5 min read',
                        content: `
### Never Pay Full Price at the Bookstore
College bookstores are a rip-off. Here is how to beat the system.

#### Textbooks
1.  **Library:** Check if your library has the book on reserve. You can scan the chapters you need for free.
2.  **Rent:** Chegg, Amazon, and CampusBookRentals allow you to rent for a fraction of the price.
3.  **Older Editions:** Ask your professor if the 4th edition is okay instead of the 5th. Usually, only the page numbers change. Cost difference: $200 vs $20.
4.  **PDFs:** Search online. You might get lucky.

#### Tech Discounts
*   **Software:** Students get Microsoft Office, GitHub Pro, and Notion Personal Pro for free. Adobe Creative Cloud is 60% off.
*   **Hardware:** Apple and Samsung have education stores with discounted laptops and tablets.
                        `,
                        resources: [
                            { title: 'Chegg: Rent Textbooks', url: 'https://www.chegg.com/books', type: 'tool' },
                            { title: 'GitHub Student Developer Pack', url: 'https://education.github.com/pack', type: 'tool' }
                        ]
                    },
                    {
                        id: 'meal-prep',
                        title: 'Meal Prepping on a Budget',
                        duration: '6 min read',
                        content: `
### Eating Good for $3/Meal
Dining hall plans are expensive, and Uber Eats is a wallet killer.

#### The Strategy
1.  **Buy in Bulk:** Rice, beans, pasta, oats, and frozen veggies are dirt cheap.
2.  **Cook Once, Eat Twice:** Make a huge pot of chili or stir-fry on Sunday. Portion it into containers.
3.  **The "Poor Man's" Protein:** Eggs, tuna, and peanut butter are the cheapest sources of protein.

#### Example Shopping List ($30/week)
*   Oats ($3)
*   Bananas ($2)
*   Eggs ($4)
*   Rice ($3)
*   Beans ($2)
*   Frozen Veggies ($4)
*   Chicken Thighs ($8)
*   Pasta & Sauce ($4)
                        `,
                        resources: [
                            { title: 'Budget Bytes: Delicious Recipes for Less', url: 'https://www.budgetbytes.com/', type: 'tool' },
                            { title: 'USDA: Eating Healthy on a Budget', url: 'https://www.myplate.gov/eat-healthy/healthy-eating-budget', type: 'article' }
                        ]
                    },
                    {
                        id: 'student-loans-101',
                        title: 'Understanding Student Loans',
                        duration: '8 min read',
                        content: `
### Subsidized vs. Unsubsidized
Not all loans are the same.

#### Subsidized Loans (The Good Kind)
*   **Who pays interest?** The government pays the interest while you are in school.
*   **Strategy:** Take these first.

#### Unsubsidized Loans (The Bad Kind)
*   **Who pays interest?** YOU do. Interest starts accruing the day you take the loan.
*   **Strategy:** Pay the interest while you are in school if you can (even $20/month helps), so it doesn't compound.

#### Private Loans (The Ugly Kind)
*   **Interest:** Usually higher and variable.
*   **Protections:** None. No forgiveness, no income-driven repayment.
*   **Strategy:** Avoid at all costs unless absolutely necessary.
                        `,
                        resources: [
                            { title: 'StudentAid.gov', url: 'https://studentaid.gov/', type: 'tool' },
                            { title: 'Finaid.org: Loan Calculator', url: 'https://www.finaid.org/calculators/loanpayments/', type: 'tool' }
                        ]
                    }
                ]
            },
            {
                id: 'side-hustles',
                title: 'Side Hustles 101',
                description: 'Make extra money in the gig economy.',
                icon: 'Zap',
                level: 'Beginner',
                lessons: [
                    {
                        id: 'gig-economy',
                        title: 'The Gig Economy: Uber, DoorDash, TaskRabbit',
                        duration: '6 min read',
                        content: `
### Trading Time for Money
The easiest way to start earning *today*.

#### Pros
*   **Instant Access:** Sign up and start working in days.
*   **Flexibility:** Work whenever you want.

#### Cons
*   **Wear & Tear:** Driving destroys your car's value.
*   **Taxes:** You are a 1099 contractor. You must save 30% of your earnings for taxes yourself.
*   **No Benefits:** No health insurance, no paid time off.

#### Best For
*   Quick cash for an emergency.
*   Filling gaps between jobs.
                        `,
                        resources: [
                            { title: 'IRS: Gig Economy Tax Center', url: 'https://www.irs.gov/businesses/gig-economy-tax-center', type: 'article' },
                            { title: 'NerdWallet: Best Side Hustles', url: 'https://www.nerdwallet.com/article/finance/side-hustles', type: 'article' }
                        ]
                    },
                    {
                        id: 'freelancing-basics',
                        title: 'Freelancing: Upwork & Fiverr',
                        duration: '7 min read',
                        content: `
### Monetize Your Skills
Do you know how to write? Code? Design? Edit video?

#### Platforms
*   **Upwork:** Best for long-term professional relationships.
*   **Fiverr:** Best for quick, packaged gigs (e.g., "I will design a logo for $50").

#### How to Price Yourself
*   **Don't undersell:** If you charge $5/hr, clients will treat you like a $5/hr worker.
*   **Value-Based:** Charge for the *result*, not the hour. If your logo helps them sell $10k more product, a $500 fee is a bargain.

#### The "Portfolio" Hack
No experience? Do 3 projects for free for non-profits or friends. Now you have a portfolio.
                        `,
                        resources: [
                            { title: 'Upwork: Freelancing Guide', url: 'https://www.upwork.com/resources/how-to-start-freelancing', type: 'article' },
                            { title: 'Freelancers Union', url: 'https://www.freelancersunion.org/', type: 'tool' }
                        ]
                    },
                    {
                        id: 'flipping-reselling',
                        title: 'Flipping & Reselling',
                        duration: '6 min read',
                        content: `
### Buy Low, Sell High
The oldest business model in the world.

#### Where to Source
*   **Thrift Stores:** Look for vintage clothes, solid wood furniture, and electronics.
*   **Garage Sales:** The best margins. People just want stuff gone.
*   **Facebook Marketplace:** Look for "free" items you can clean up and sell.

#### Where to Sell
*   **Poshmark/Depop:** Clothing.
*   **eBay:** Electronics and collectibles.
*   **Facebook Marketplace:** Furniture and large items (no shipping).

**Real Life Example:** Buying a dirty solid wood dresser for $20, sanding and painting it ($10 supplies), and selling it for $150. Profit: $120.
                        `,
                        resources: [
                            { title: 'GaryVee: Trash Talk (Flipping)', url: 'https://www.youtube.com/watch?v=5y2t_h7t_h8', type: 'video' },
                            { title: 'eBay: Seller Center', url: 'https://www.ebay.com/sellercenter', type: 'tool' }
                        ]
                    }
                ]
            },
            {
                id: 'credit-debt',
                title: 'Credit & Debt Management',
                description: 'Learn how to build a great credit score and manage debt effectively.',
                icon: 'CreditCard',
                level: 'Beginner',
                lessons: [
                    {
                        id: 'credit-scores-explained',
                        title: 'Understanding Credit Scores',
                        duration: '6 min read',
                        content: `
### The Adult Report Card
Your credit score (FICO score) is a number between 300 and 850 that tells lenders how risky you are.

#### The Ranges
*   **800-850:** Exceptional
*   **740-799:** Very Good
*   **670-739:** Good
*   **580-669:** Fair
*   **300-579:** Poor

#### What Makes Up Your Score?
1.  **Payment History (35%):** Do you pay on time? Never miss a payment.
2.  **Amounts Owed (30%):** Credit utilization. Keep your balance below 30% of your limit. (e.g., if limit is $1000, spend <$300).
3.  **Length of Credit History (15%):** Longer is better. Don't close your oldest cards.
4.  **New Credit (10%):** Don't open too many accounts at once.
5.  **Credit Mix (10%):** Having different types of credit (credit cards, auto loans, student loans).

**Action Item:** Check your credit score for free using apps like Credit Karma or your bank's app.
                        `,
                        resources: [
                            { title: 'AnnualCreditReport.com (Official Free Report)', url: 'https://www.annualcreditreport.com/index.action', type: 'tool' },
                            { title: 'myFICO: What is a Credit Score?', url: 'https://www.myfico.com/credit-education/what-is-a-fico-score', type: 'article' }
                        ]
                    },
                    {
                        id: 'credit-cards-friend-foe',
                        title: 'Credit Cards: Friend or Foe?',
                        duration: '5 min read',
                        content: `
### The Double-Edged Sword
Credit cards can be a powerful tool for building wealth or a trap that ruins your finances.

#### The Good (Friend)
*   **Rewards:** Cash back, travel points, sign-up bonuses.
*   **Security:** Fraud protection is better than debit cards.
*   **Credit Building:** Responsible use boosts your score.
*   **Perks:** Extended warranties, travel insurance.

#### The Bad (Foe)
*   **Interest:** Credit card interest rates (APR) are insane (20-30%).
*   **Debt Spiral:** Minimum payments barely cover interest.
*   **Overspending:** It's psychologically easier to swipe than spend cash.

#### The Golden Rule
**Treat your credit card like a debit card.** Only spend money you actually have in the bank right now. Pay your balance in full every single month. If you do this, you will never pay a cent of interest.
                        `,
                        resources: [
                            { title: 'NerdWallet: Best Credit Cards', url: 'https://www.nerdwallet.com/the-best-credit-cards', type: 'article' },
                            { title: 'Investopedia: How Credit Cards Work', url: 'https://www.investopedia.com/terms/c/creditcard.asp', type: 'article' }
                        ]
                    },
                    {
                        id: 'managing-debt',
                        title: 'Debt Repayment Strategies',
                        duration: '8 min read',
                        content: `
### Crushing Your Debt
If you have debt, you need a plan. Here are the two best methods:

#### 1. The Avalanche Method (Mathematically Superior)
*   **Strategy:** List debts by **Interest Rate** (Highest to Lowest).
*   **Action:** Pay minimums on everything, throw all extra money at the debt with the **highest interest rate**.
*   **Why:** You save the most money on interest.

#### 2. The Snowball Method (Psychologically Superior)
*   **Strategy:** List debts by **Balance** (Smallest to Largest).
*   **Action:** Pay minimums on everything, throw all extra money at the **smallest debt**.
*   **Why:** You get quick wins. Clearing a small debt feels good and motivates you to keep going.

**Which is better?** The one you stick to. If you need motivation, go Snowball. If you're a math nerd, go Avalanche.
                        `,
                        resources: [
                            { title: 'Undebt.it: Debt Payoff Calculator', url: 'https://undebt.it/', type: 'tool' },
                            { title: 'Dave Ramsey: Debt Snowball vs Avalanche', url: 'https://www.ramseysolutions.com/debt/debt-snowball-vs-debt-avalanche', type: 'article' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'adulting',
        title: 'Adulting & Major Purchases',
        description: 'Navigate the big financial decisions of adulthood: housing, cars, and insurance.',
        modules: [
            {
                id: 'career-income',
                title: 'Career & Income',
                description: 'Maximize your earning potential.',
                icon: 'Briefcase',
                level: 'Intermediate',
                lessons: [
                    {
                        id: 'negotiating-salary',
                        title: 'Negotiating Your Salary',
                        duration: '8 min read',
                        content: `
### You Don't Get What You Deserve, You Get What You Negotiate
Most people leave thousands of dollars on the table because they are afraid to ask.

#### The Script
**Don't say:** "I want more money."
**Say:** "Based on my research of the market value for this role and my specific experience with [Skill X] and [Skill Y], I was looking for a salary in the range of $X to $Y."

#### When to Negotiate
1.  **New Job Offer:** This is your highest leverage point. They want you.
2.  **Performance Review:** Bring a "Brag Sheet" of everything you accomplished this year. Quantify your impact (e.g., "Increased sales by 20%").

#### Non-Salary Perks
If they can't budge on salary, ask for:
*   More PTO
*   Signing bonus
*   Work from home days
*   Education stipend
                        `,
                        resources: [
                            { title: 'Glassdoor: Salary Calculator', url: 'https://www.glassdoor.com/Salaries/index.htm', type: 'tool' },
                            { title: 'Harvard Law: Salary Negotiation Scripts', url: 'https://www.pon.harvard.edu/daily/salary-negotiations/salary-negotiation-scripts/', type: 'article' }
                        ]
                    },
                    {
                        id: 'equity-stock-options',
                        title: 'Understanding Equity & Stock Options',
                        duration: '7 min read',
                        content: `
### Owning a Piece of the Pie
In tech and startups, equity can be worth more than your salary.

#### ISOs vs. NSOs vs. RSUs
*   **RSUs (Restricted Stock Units):** Standard for big companies (Google, Amazon). It's basically cash stock. You get shares, they vest, you sell them.
*   **ISOs (Incentive Stock Options):** Common in startups. You have the *option* to buy shares at a low price (strike price). High risk, high reward. Tax advantages if held correctly.
*   **NSOs (Non-Qualified Stock Options):** Similar to ISOs but fewer tax benefits.

#### Vesting Schedule
Usually 4 years with a "1-year cliff".
*   **Cliff:** If you leave before 1 year, you get nothing.
*   **Vesting:** After year 1, you get 25%. Then you get 1/48th every month.
                        `,
                        resources: [
                            { title: 'Carta: Equity 101', url: 'https://carta.com/blog/equity-101/', type: 'article' },
                            { title: 'Holloway Guide to Equity Compensation', url: 'https://www.holloway.com/g/equity-compensation', type: 'article' }
                        ]
                    },
                    {
                        id: 'employee-benefits',
                        title: 'Employee Benefits Deep Dive',
                        duration: '6 min read',
                        content: `
### The Hidden Paycheck
Your benefits package can add 30% to your total compensation.

#### Health Savings Account (HSA)
*   **The Triple Tax Threat:** Tax-deductible contributions, tax-free growth, tax-free withdrawals for medical expenses.
*   **Strategy:** Treat it like a retirement account. Pay medical bills out of pocket if you can, and let the HSA grow for 30 years.

#### Flexible Spending Account (FSA)
*   **Use it or Lose it:** Pre-tax money for health/childcare, but it expires at the end of the year. Be careful not to overfund it.

#### 401(k) Match
*   We said it before, we'll say it again: **It is free money.**
                        `,
                        resources: [
                            { title: 'Healthcare.gov: HSA vs FSA', url: 'https://www.healthcare.gov/have-job-based-coverage/flexible-spending-accounts/', type: 'article' },
                            { title: 'Investopedia: Employee Benefits', url: 'https://www.investopedia.com/terms/e/employee-benefits.asp', type: 'article' }
                        ]
                    }
                ]
            },
            {
                id: 'travel-lifestyle',
                title: 'Travel & Lifestyle',
                description: 'See the world without going broke.',
                icon: 'Plane',
                level: 'Intermediate',
                lessons: [
                    {
                        id: 'travel-hacking',
                        title: 'Travel Hacking 101',
                        duration: '10 min read',
                        content: `
### Flying for Free
Travel hacking is the art of using credit card points and miles to travel for pennies.

#### The Basics
1.  **Sign-Up Bonuses (SUBs):** The fastest way to earn points. "Spend $4,000 in 3 months, get 60,000 points."
2.  **Transfer Partners:** Don't use points on the Chase portal. Transfer them to airlines (United, British Airways) for maximum value.
3.  **The 5/24 Rule:** Chase won't approve you if you've opened 5+ cards in the last 24 months. Start with Chase cards first.

#### Warning
**Do not do this if you carry a balance.** Paying 25% interest to earn 2% in points is a losing game.
                        `,
                        resources: [
                            { title: 'The Points Guy: Beginner Guide', url: 'https://thepointsguy.com/guide/beginners-guide/', type: 'article' },
                            { title: 'AwardHacker: Find Best Redemptions', url: 'https://www.awardhacker.com/', type: 'tool' }
                        ]
                    },
                    {
                        id: 'cost-of-pets',
                        title: 'The True Cost of Pets',
                        duration: '5 min read',
                        content: `
### Fur Babies are Expensive
We love them, but they are a luxury item.

#### The Breakdown
*   **Adoption:** $50 - $500.
*   **Food:** $30 - $100/month.
*   **Vet Bills:** Routine ($200/year) vs. Emergency ($2,000 - $10,000).
*   **Pet Insurance:** ~$30-$50/month. Highly recommended. One surgery pays for 5 years of premiums.
*   **Boarding/Sitters:** $50/night when you travel.

**Total:** A dog can cost $15,000 - $30,000 over its lifetime. Budget accordingly.
                        `,
                        resources: [
                            { title: 'ASPCA: Pet Care Costs', url: 'https://www.aspca.org/pet-care/general-pet-care/cutting-pet-care-costs', type: 'article' },
                            { title: 'Pawlicy Advisor: Compare Pet Insurance', url: 'https://www.pawlicy.com/', type: 'tool' }
                        ]
                    },
                    {
                        id: 'wedding-budget',
                        title: 'Weddings on a Budget',
                        duration: '6 min read',
                        content: `
### The $30,000 Party
The average US wedding costs $30k. Here is how to slash that.

#### Save
*   **Venue:** Rent a park, a friend's backyard, or an Airbnb instead of a "Wedding Venue."
*   **Date:** Saturday night in June is the most expensive time. Friday in November is half price.
*   **Flowers:** Use greenery or fake flowers. Fresh flowers die in 24 hours.
*   **Guest List:** The easiest way to save money is to invite fewer people.

#### Splurge
*   **Photographer:** The photos last forever.
*   **Food/DJ:** This is what guests remember.
                        `,
                        resources: [
                            { title: 'The Knot: Budget Calculator', url: 'https://www.theknot.com/wedding-budget', type: 'tool' },
                            { title: 'A Practical Wedding: Budget Spreadsheets', url: 'https://apracticalwedding.com/wedding-budget-spreadsheet-free/', type: 'tool' }
                        ]
                    }
                ]
            },
            {
                id: 'smart-spending',
                title: 'Smart Spending & Lifestyle',
                description: 'Make informed decisions about the biggest purchases of your life.',
                icon: 'Briefcase',
                level: 'Intermediate',
                lessons: [
                    {
                        id: 'rent-vs-buy',
                        title: 'Renting vs. Buying a Home',
                        duration: '8 min read',
                        content: `
### The American Dream?
Buying a home isn't always better than renting. It depends on your situation.

#### The Case for Renting
*   **Flexibility:** Easy to move for a new job.
*   **No Maintenance:** Toilet breaks? Call the landlord.
*   **Lower Upfront Costs:** Security deposit vs. Down payment.
*   **Investing Difference:** If renting is cheaper, you can invest the difference in the stock market (which often outperforms real estate).

#### The Case for Buying
*   **Equity:** You're paying yourself, not a landlord.
*   **Stability:** No rent hikes, no eviction.
*   **Customization:** Paint the walls whatever color you want.
*   **Tax Benefits:** Mortgage interest deduction (sometimes).

#### The 5-Year Rule
Generally, if you plan to stay in a home for less than 5 years, renting is cheaper due to closing costs (buying/selling fees).
                        `,
                        resources: [
                            { title: 'NYT: Rent vs Buy Calculator', url: 'https://www.nytimes.com/interactive/2014/upshot/buy-rent-calculator.html', type: 'tool' },
                            { title: 'NerdWallet: Rent vs Buy', url: 'https://www.nerdwallet.com/mortgages/rent-vs-buy-calculator', type: 'tool' }
                        ]
                    },
                    {
                        id: 'car-buying',
                        title: 'Car Buying: Lease vs. Loan vs. Cash',
                        duration: '6 min read',
                        content: `
### How to Buy a Car Without Getting Fleeced
Cars are depreciating assets. They lose value every day.

#### 1. Buying Cash (Best)
*   **Pros:** No debt, no interest, you own it.
*   **Cons:** Requires liquid cash.

#### 2. Financing (Loan)
*   **Pros:** Drive a better car than you can buy cash, build credit.
*   **Cons:** Interest payments, monthly obligation.
*   **Rule:** 20/4/10 Rule. Put 20% down, finance for no more than 4 years, keep payments under 10% of monthly income.

#### 3. Leasing (Worst for Wealth)
*   **Pros:** New car every 3 years, lower monthly payment.
*   **Cons:** You own nothing at the end. It's a long-term rental. Mileage limits.
*   **Verdict:** Only lease if you can write it off as a business expense or if you simply value driving a new car more than building wealth.
                        `,
                        resources: [
                            { title: 'Kelley Blue Book', url: 'https://www.kbb.com/', type: 'tool' },
                            { title: 'Edmunds: Car Loan Calculator', url: 'https://www.edmunds.com/calculators/', type: 'tool' }
                        ]
                    },
                    {
                        id: 'insurance-101',
                        title: 'Insurance 101: Protecting Your Assets',
                        duration: '7 min read',
                        content: `
### Don't Let One Bad Day Ruin You
Insurance transfers risk from you to a company.

#### Must-Haves
1.  **Health Insurance:** Medical bills are the #1 cause of bankruptcy in the US.
2.  **Auto Insurance:** Legally required. Get enough liability coverage.
3.  **Renters/Homeowners Insurance:** Protects your stuff from theft/fire and provides liability if someone gets hurt at your place. Renters insurance is cheap (~$15/mo).
4.  **Life Insurance:** Only needed if someone depends on your income (spouse, kids). Term life is cheap and best for most. Avoid Whole Life unless you're ultra-wealthy.
5.  **Disability Insurance:** Protects your income if you can't work. Often offered by employers.
                        `,
                        resources: [
                            { title: 'PolicyGenius: Compare Insurance', url: 'https://www.policygenius.com/', type: 'tool' },
                            { title: 'Investopedia: Insurance Basics', url: 'https://www.investopedia.com/insurance/insurance-basics/', type: 'article' }
                        ]
                    }
                ]
            },
            {
                id: 'taxes-employment',
                title: 'Taxes & Employment',
                description: 'Understand your paycheck and how to keep more of what you earn.',
                icon: 'FileText',
                level: 'Intermediate',
                lessons: [
                    {
                        id: 'paycheck-breakdown',
                        title: 'Understanding Your Paycheck',
                        duration: '5 min read',
                        content: `
### Where Did My Money Go?
You got a job for $60,000/year ($5,000/mo), but your check is only $3,800. Why?

#### The Deductions
*   **Federal Income Tax:** Goes to the US government. Progressive rates.
*   **State Income Tax:** Goes to your state (unless you live in TX, FL, WA, etc.).
*   **FICA (Social Security & Medicare):** 7.65% of your pay. Mandatory.
*   **Health Insurance:** Your share of the premium.
*   **401(k):** Your retirement contribution (this is good!).

#### Gross vs. Net
*   **Gross Pay:** Your salary before taxes.
*   **Net Pay:** What actually hits your bank account. Base your budget on this number.
                        `,
                        resources: [
                            { title: 'ADP: Salary Paycheck Calculator', url: 'https://www.adp.com/resources/tools/calculators/salary-paycheck-calculator.aspx', type: 'tool' },
                            { title: 'IRS: Tax Withholding Estimator', url: 'https://www.irs.gov/individuals/tax-withholding-estimator', type: 'tool' }
                        ]
                    },
                    {
                        id: 'tax-basics',
                        title: 'Tax Basics: Brackets & Deductions',
                        duration: '6 min read',
                        content: `
### Marginal Tax Rates
We have a progressive tax system. Being in the "22% bracket" doesn't mean you pay 22% on everything.

**Example (Single Filer, 2024 numbers approx):**
*   First $11,600 is taxed at 10%.
*   Income from $11,601 to $47,150 is taxed at 12%.
*   Income from $47,151 to $100,525 is taxed at 22%.

If you earn $50,000, you only pay 22% on the small amount above $47,150. Earning more money never results in less take-home pay.

#### Standard Deduction vs. Itemizing
*   **Standard Deduction:** A flat amount you can deduct from your taxable income ($14,600 for singles in 2024). Most people take this.
*   **Itemizing:** Listing out specific deductions (mortgage interest, charity, state taxes). Only do this if your total is higher than the standard deduction.
                        `,
                        resources: [
                            { title: 'IRS: Free File', url: 'https://www.irs.gov/filing/free-file-do-your-federal-taxes-for-free', type: 'tool' },
                            { title: 'Tax Foundation: Tax Brackets', url: 'https://taxfoundation.org/data/all/federal/2024-tax-brackets/', type: 'article' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'investing',
        title: 'Investing & Wealth Building',
        description: 'Strategies to grow your wealth and achieve financial independence.',
        modules: [
            {
                id: 'investing-beginners',
                title: 'Investing for Beginners',
                description: 'Start your journey to becoming an investor.',
                icon: 'TrendingUp',
                level: 'Intermediate',
                lessons: [
                    {
                        id: 'stocks-bonds-funds',
                        title: 'Stocks, Bonds, and Funds',
                        duration: '6 min read',
                        content: `
### The Menu of Investments

#### Stocks (Equities)
*   **What:** Ownership in a company.
*   **Risk:** High. Prices fluctuate daily.
*   **Reward:** High. Historically ~10% average annual return (S&P 500).

#### Bonds (Fixed Income)
*   **What:** Loaning money to a government or company.
*   **Risk:** Low to Medium.
*   **Reward:** Low to Medium. They pay you interest.

#### Mutual Funds & ETFs (Exchange Traded Funds)
*   **What:** A basket of hundreds or thousands of stocks/bonds bundled together.
*   **Why:** Instant diversification. Instead of buying Apple, you buy a fund that owns Apple, Microsoft, Amazon, and 497 others.
*   **Recommendation:** Index Funds (e.g., S&P 500 ETF like VOO or SPY) are the best way for most people to invest. Low fees, market-matching returns.
                        `,
                        resources: [
                            { title: 'Investopedia: Investing 101', url: 'https://www.investopedia.com/investing-4427685', type: 'article' },
                            { title: 'Vanguard: ETF vs Mutual Fund', url: 'https://investor.vanguard.com/investor-resources-education/etfs/etf-vs-mutual-fund', type: 'article' }
                        ]
                    },
                    {
                        id: 'retirement-accounts',
                        title: 'Retirement Accounts: 401k vs. IRA',
                        duration: '7 min read',
                        content: `
### Tax-Advantaged Accounts
The government wants you to save for retirement, so they give you tax breaks.

#### 401(k)
*   **Offered by:** Employer.
*   **Benefit:** Contributions reduce your taxable income this year.
*   **Free Money:** Many employers "match" your contribution (e.g., 3-5%). **ALWAYS take the match.** It's a guaranteed 100% return.

#### Traditional IRA (Individual Retirement Account)
*   **Offered by:** You open it yourself (Vanguard, Fidelity, Schwab).
*   **Benefit:** Tax deduction now, pay taxes when you withdraw in retirement.

#### Roth IRA
*   **Offered by:** You open it yourself.
*   **Benefit:** Pay taxes now, **tax-free growth and withdrawals** forever.
*   **Best for:** Young people who expect to be in a higher tax bracket later.

**Order of Operations:**
1.  401(k) up to the match.
2.  Max out Roth IRA.
3.  Max out remaining 401(k).
                        `,
                        resources: [
                            { title: 'IRS: Retirement Plans', url: 'https://www.irs.gov/retirement-plans', type: 'article' },
                            { title: 'NerdWallet: Roth IRA vs Traditional IRA', url: 'https://www.nerdwallet.com/article/investing/roth-or-traditional-ira-account', type: 'article' }
                        ]
                    }
                ]
            },
            {
                id: 'modern-investing',
                title: 'Modern Investing: Crypto & Web3',
                description: 'Understanding the new frontier of finance.',
                icon: 'Cpu',
                level: 'Advanced',
                lessons: [
                    {
                        id: 'crypto-basics',
                        title: 'Crypto Basics: Bitcoin & Ethereum',
                        duration: '8 min read',
                        content: `
### Digital Gold?
Cryptocurrency is digital money that isn't controlled by a bank or government.

#### Bitcoin (BTC)
*   **The Original:** Created in 2009.
*   **Purpose:** Store of value (like digital gold).
*   **Scarcity:** There will only ever be 21 million Bitcoins.

#### Ethereum (ETH)
*   **The Platform:** A programmable blockchain.
*   **Smart Contracts:** Code that executes automatically (e.g., "If X happens, pay Y"). Used for NFTs and DeFi.

#### The Risks
*   **Volatility:** It can drop 50% in a week.
*   **Security:** If you lose your password (private key), your money is gone forever.
*   **Strategy:** Only invest what you can afford to lose (1-5% of portfolio).
                        `,
                        resources: [
                            { title: 'Coinbase: What is Crypto?', url: 'https://www.coinbase.com/learn/crypto-basics/what-is-cryptocurrency', type: 'article' },
                            { title: 'Investopedia: Bitcoin Explained', url: 'https://www.investopedia.com/terms/b/bitcoin.asp', type: 'article' }
                        ]
                    },
                    {
                        id: 'web3-nfts',
                        title: 'Web3 & NFTs: Hype vs. Utility',
                        duration: '6 min read',
                        content: `
### JPEGs or Future of Ownership?
NFTs (Non-Fungible Tokens) are digital certificates of ownership.

#### Use Cases
*   **Art:** Digital collectibles (Bored Apes).
*   **Gaming:** Owning your in-game items (swords, skins).
*   **Membership:** Access to exclusive communities or events.

#### The Bubble
99% of NFT projects will go to zero. It is a highly speculative market. Do your own research (DYOR).
                        `,
                        resources: [
                            { title: 'OpenSea: NFT Marketplace', url: 'https://opensea.io/', type: 'tool' },
                            { title: 'Harvard Business Review: What is Web3?', url: 'https://hbr.org/2022/05/what-is-web3', type: 'article' }
                        ]
                    },
                    {
                        id: 'esg-investing',
                        title: 'ESG Investing',
                        duration: '5 min read',
                        content: `
### Investing with a Conscience
ESG stands for Environmental, Social, and Governance.

*   **Environmental:** Does the company pollute?
*   **Social:** Do they treat workers well? Diversity?
*   **Governance:** Is the board corrupt?

**How to do it:** Look for ESG ETFs (e.g., ESGU). Note: Sometimes fees are higher, and definitions of "green" can be vague (Greenwashing).
                        `,
                        resources: [
                            { title: 'MSCI: ESG Ratings', url: 'https://www.msci.com/our-solutions/esg-investing/esg-ratings', type: 'tool' },
                            { title: 'Investopedia: ESG Investing', url: 'https://www.investopedia.com/terms/e/environmental-social-and-governance-esg-criteria.asp', type: 'article' }
                        ]
                    }
                ]
            },
            {
                id: 'fire-movement',
                title: 'The FIRE Movement',
                description: 'Financial Independence, Retire Early.',
                icon: 'Flame',
                level: 'Mastery',
                lessons: [
                    {
                        id: 'what-is-fire',
                        title: 'What is FIRE?',
                        duration: '7 min read',
                        content: `
### Quit Your Job at 35?
FIRE is about saving aggressively so you have the *option* to stop working.

#### Types of FIRE
1.  **Lean FIRE:** Living on a bare-bones budget ($25k/year) to retire ASAP.
2.  **Fat FIRE:** Retiring with a lavish lifestyle ($100k+/year). Requires a huge portfolio.
3.  **Coast FIRE:** Saving enough early on so that compound interest covers your retirement. You still work to cover daily bills, but you stop saving.
4.  **Barista FIRE:** Retiring from a high-stress job to work a low-stress part-time job (like a barista) for health insurance and pocket money.
                        `,
                        resources: [
                            { title: 'Mr. Money Mustache', url: 'https://www.mrmoneymustache.com/', type: 'article' },
                            { title: 'Reddit: r/financialindependence', url: 'https://www.reddit.com/r/financialindependence/', type: 'tool' }
                        ]
                    },
                    {
                        id: '4-percent-rule',
                        title: 'The 4% Rule Explained',
                        duration: '6 min read',
                        content: `
### The Magic Number
How much do you need to retire?
**The Rule:** You can safely withdraw 4% of your portfolio every year without running out of money for 30 years.

#### The Math
*   **Annual Spending:** $40,000
*   **Portfolio Needed:** $40,000 x 25 = **$1,000,000**

If you have $1M invested in a mix of stocks/bonds, you can pull out $40k/year forever (adjusting for inflation).
                        `,
                        resources: [
                            { title: 'Vanguard: Retirement Nest Egg Calculator', url: 'https://investor.vanguard.com/tools-calculators/retirement-nest-egg-calculator', type: 'tool' },
                            { title: 'Investopedia: 4% Rule', url: 'https://www.investopedia.com/terms/f/four-percent-rule.asp', type: 'article' }
                        ]
                    },
                    {
                        id: 'geodiversity',
                        title: 'Geodiversity & Geo-Arbitrage',
                        duration: '5 min read',
                        content: `
### Earn in Dollars, Spend in Pesos
Geo-arbitrage means living in a low-cost area while earning a high income.

*   **Remote Work:** Work for a US tech company while living in Portugal, Thailand, or Mexico.
*   **Retirement:** Your $1M portfolio might be "middle class" in New York, but it makes you "wealthy" in Bali.
*   **Tax Implications:** Be careful. US citizens are taxed on global income.
                        `,
                        resources: [
                            { title: 'Nomad List', url: 'https://nomadlist.com/', type: 'tool' },
                            { title: 'IRS: Foreign Earned Income Exclusion', url: 'https://www.irs.gov/individuals/international-taxpayers/foreign-earned-income-exclusion', type: 'article' }
                        ]
                    }
                ]
            },
            {
                id: 'advanced-investing',
                title: 'Advanced Investing',
                description: 'Optimize your portfolio and minimize taxes.',
                icon: 'TrendingUp',
                level: 'Advanced',
                lessons: [
                    {
                        id: 'asset-allocation',
                        title: 'Asset Allocation & Rebalancing',
                        duration: '8 min read',
                        content: `
### Don't Put All Your Eggs in One Basket
Asset allocation is how you divide your portfolio between stocks, bonds, and cash.

#### Risk Tolerance
*   **Aggressive (Young):** 90% Stocks / 10% Bonds. Volatile but high growth.
*   **Moderate:** 60% Stocks / 40% Bonds. Balanced.
*   **Conservative (Retired):** 30% Stocks / 70% Bonds. Stable income.

#### Rebalancing
Over time, your winners grow and skew your allocation.
*   *Example:* You start 50/50. Stocks double. Now you're 66/33.
*   *Action:* Sell some stocks and buy bonds to get back to 50/50. This forces you to "buy low, sell high" automatically.
                        `,
                        resources: [
                            { title: 'Vanguard: Portfolio Allocation Models', url: 'https://investor.vanguard.com/investor-resources-education/education/model-portfolio-allocation', type: 'tool' },
                            { title: 'Investopedia: Asset Allocation', url: 'https://www.investopedia.com/terms/a/assetallocation.asp', type: 'article' }
                        ]
                    },
                    {
                        id: 'real-estate-investing',
                        title: 'Real Estate Investing',
                        duration: '9 min read',
                        content: `
### Beyond Your Own Home

#### Rental Properties
*   **Pros:** Cash flow (rent), appreciation, tax write-offs, leverage (using bank's money).
*   **Cons:** Being a landlord is work (repairs, tenants). Illiquid (hard to sell fast).

#### REITs (Real Estate Investment Trusts)
*   **What:** Companies that own real estate (malls, apartments, data centers). You buy shares like a stock.
*   **Pros:** Exposure to real estate without fixing toilets. High dividends.
*   **Cons:** Taxed as ordinary income.

#### House Hacking
*   **Strategy:** Buy a duplex/triplex. Live in one unit, rent the others. The rent covers your mortgage. You live for free.
                        `,
                        resources: [
                            { title: 'BiggerPockets: Real Estate Investing', url: 'https://www.biggerpockets.com/', type: 'tool' },
                            { title: 'Investopedia: REITs', url: 'https://www.investopedia.com/terms/r/reit.asp', type: 'article' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'business',
        title: 'Business & Entrepreneurship',
        description: 'Launch your startup, manage business finances, and scale.',
        modules: [
            {
                id: 'digital-entrepreneurship',
                title: 'Digital Entrepreneurship',
                description: 'Building a business on the internet.',
                icon: 'Laptop',
                level: 'Intermediate',
                lessons: [
                    {
                        id: 'personal-brand',
                        title: 'Building a Personal Brand',
                        duration: '6 min read',
                        content: `
### You Are the Niche
In 2024, a personal brand is your resume.

#### Platforms
*   **LinkedIn:** For B2B, consulting, and career growth.
*   **Twitter/X:** For tech, crypto, and networking.
*   **TikTok/IG:** For consumer products and lifestyle.

#### Strategy
1.  **Pick a Topic:** What are you an expert in? (or what are you learning?)
2.  **Consistency:** Post daily.
3.  **Value:** Teach, don't just brag. "How I did X" is better than "Look at my X".
                        `,
                        resources: [
                            { title: 'GaryVee: Personal Branding', url: 'https://www.garyvaynerchuk.com/personal-brand/', type: 'article' },
                            { title: 'LinkedIn: Creator Mode', url: 'https://members.linkedin.com/linkedin-creators', type: 'tool' }
                        ]
                    },
                    {
                        id: 'content-creation',
                        title: 'Content Creation as a Business',
                        duration: '7 min read',
                        content: `
### The Creator Economy
You don't need millions of followers. You need 1,000 true fans.

#### Monetization
1.  **Ad Revenue:** YouTube Adsense (slow).
2.  **Sponsorships:** Brands pay you to mention them.
3.  **Affiliate Marketing:** You recommend a product, you get a %.
4.  **Digital Products:** Selling your own ebook, course, or templates (Highest margin).
                        `,
                        resources: [
                            { title: 'Kevin Kelly: 1000 True Fans', url: 'https://kk.org/thetechnium/1000-true-fans/', type: 'article' },
                            { title: 'Gumroad: Sell Digital Products', url: 'https://gumroad.com/', type: 'tool' }
                        ]
                    },
                    {
                        id: 'ecommerce-basics',
                        title: 'E-commerce: Shopify vs. Amazon',
                        duration: '8 min read',
                        content: `
### Selling Physical Goods

#### Shopify (DTC - Direct to Consumer)
*   **Pros:** You own the customer data (email list). You build a brand.
*   **Cons:** You have to drive your own traffic (Ads, Social).

#### Amazon FBA (Fulfillment by Amazon)
*   **Pros:** Amazon has millions of shoppers. They handle shipping.
*   **Cons:** You don't own the customer. Amazon takes a huge cut (30-40%). High competition.
                        `,
                        resources: [
                            { title: 'Shopify: Start a Business', url: 'https://www.shopify.com/blog/start-a-business', type: 'article' },
                            { title: 'Jungle Scout: Amazon FBA Guide', url: 'https://www.junglescout.com/blog/how-to-sell-on-amazon-fba/', type: 'article' }
                        ]
                    }
                ]
            },
            {
                id: 'starting-business',
                title: 'Starting a Business',
                description: 'From idea to legal entity.',
                icon: 'Rocket',
                level: 'Advanced',
                lessons: [
                    {
                        id: 'business-structures',
                        title: 'Business Structures: LLC vs. Corp',
                        duration: '6 min read',
                        content: `
### Making It Official

#### Sole Proprietorship
*   **What:** You are the business.
*   **Pros:** Easiest to start. No paperwork.
*   **Cons:** **Unlimited Liability.** If the business gets sued, they can take your house and car.

#### LLC (Limited Liability Company)
*   **What:** Separate legal entity.
*   **Pros:** Protects personal assets. Flexible taxation.
*   **Cons:** Filing fees and annual reports.
*   **Verdict:** The best choice for most small businesses and freelancers.

#### C-Corp
*   **What:** Standard corporation.
*   **Pros:** Can issue stock, raise VC money.
*   **Cons:** Double taxation (corporate tax + dividend tax). Complex.

#### S-Corp
*   **What:** Tax status for LLCs/Corps.
*   **Pros:** Can save on self-employment taxes if you earn a substantial profit.
                        `,
                        resources: [
                            { title: 'SBA: Choose a Business Structure', url: 'https://www.sba.gov/business-guide/launch-your-business/choose-business-structure', type: 'article' },
                            { title: 'LegalZoom: LLC vs Corp', url: 'https://www.legalzoom.com/articles/llc-vs-corporation-vs-sole-proprietorship', type: 'article' }
                        ]
                    },
                    {
                        id: 'business-operations',
                        title: 'Business Operations & Legal',
                        duration: '7 min read',
                        content: `
### The Boring Stuff That Matters

#### Outsourcing
*   **The Trap:** Doing everything yourself.
*   **The Fix:** Hire a VA (Virtual Assistant) for $5-10/hr to handle email, scheduling, and data entry. Your time is worth $100/hr.

#### Legal Pitfalls
*   **Contracts:** Never work without one. Use templates (RocketLawyer, etc.).
*   **Trademarks:** Check the USPTO database before you name your company. You don't want to get sued for trademark infringement 2 years in.
                        `,
                        resources: [
                            { title: 'USPTO: Trademark Search', url: 'https://tmsearch.uspto.gov/search/search-results', type: 'tool' },
                            { title: 'Rocket Lawyer: Free Legal Documents', url: 'https://www.rocketlawyer.com/', type: 'tool' }
                        ]
                    },
                    {
                        id: 'cash-flow',
                        title: 'Managing Cash Flow',
                        duration: '7 min read',
                        content: `
### Cash is King
Profit is theory. Cash is reality. You can be profitable on paper and go bankrupt if you run out of cash.

#### Key Concepts
*   **Accounts Receivable (AR):** Money clients owe you.
*   **Accounts Payable (AP):** Money you owe vendors.
*   **Burn Rate:** How much cash you spend per month.
*   **Runway:** Cash Balance / Burn Rate = Months left to live.

#### Tips
1.  **Invoice Immediately:** Don't wait until the end of the month.
2.  **Net 30/60:** Understand payment terms. If you pay your staff every 2 weeks but clients pay every 60 days, you have a cash flow gap.
3.  **Cash Buffer:** Keep 3-6 months of operating expenses in the bank.
                        `,
                        resources: [
                            { title: 'SCORE: Cash Flow Template', url: 'https://www.score.org/resource/12-month-cash-flow-statement', type: 'tool' },
                            { title: 'Investopedia: Cash Flow Management', url: 'https://www.investopedia.com/terms/c/cashflow.asp', type: 'article' }
                        ]
                    }
                ]
            },
            {
                id: 'startup-finance',
                title: 'Venture Capital & Fundraising',
                description: 'Understanding the world of high-growth startups.',
                icon: 'Briefcase',
                level: 'Mastery',
                lessons: [
                    {
                        id: 'vc-basics',
                        title: 'How VC Works',
                        duration: '8 min read',
                        content: `
### The Power Law
Venture Capitalists invest in high-risk, high-reward companies. They expect 9 out of 10 to fail, but the 1 winner to return 100x and pay for all the losses.

#### Funding Rounds
1.  **Pre-Seed/Seed:** Idea stage. $500k - $3M. Building the MVP.
2.  **Series A:** Product-Market Fit. $5M - $15M. Scaling the team.
3.  **Series B:** Growth. $15M - $50M. Expanding markets.
4.  **IPO:** Going public.

#### Dilution
Every time you raise money, you sell a piece of the company. You own a smaller slice of a bigger pie.
                        `,
                        resources: [
                            { title: 'Y Combinator: Startup Library', url: 'https://www.ycombinator.com/library', type: 'article' },
                            { title: 'Paul Graham: Essays', url: 'http://www.paulgraham.com/articles.html', type: 'article' }
                        ]
                    }
                ]
            }
        ]
    }
];

export const getModuleById = (moduleId: string): Module | undefined => {
    for (const category of financialLiteracyData) {
        const module = category.modules.find(m => m.id === moduleId);
        if (module) return module;
    }
    return undefined;
};

export const getLessonById = (lessonId: string): { lesson: Lesson, module: Module } | undefined => {
    for (const category of financialLiteracyData) {
        for (const module of category.modules) {
            const lesson = module.lessons.find(l => l.id === lessonId);
            if (lesson) return { lesson, module };
        }
    }
    return undefined;
};
