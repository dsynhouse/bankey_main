
export enum Category {
  FOOD = 'Food',
  TRANSPORT = 'Transport',
  LEISURE = 'Leisure',
  SHOPPING = 'Shopping',
  BILLS = 'Bills',
  INVESTMENT = 'Investment',
  BUSINESS = 'Business',
  INCOME = 'Income',
  OTHER = 'Other'
}

export enum AccountType {
  SPENDING = 'Spending',
  SAVINGS = 'Savings',
  BUSINESS = 'Business',
  INVESTMENT = 'Investment'
}

export interface Transaction {
  id: string;
  date: string; // ISO string
  amount: number;
  category: Category;
  description: string;
  accountId: string;
  type: 'expense' | 'income';
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color: string;
}

export interface Budget {
  id?: string;
  category: Category;
  limit: number;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  emoji: string;
  deadline?: string;
}

// --- Education Types ---
export type RegionCode = 'US' | 'IN' | 'Global' | 'UK' | 'EU';

export interface LessonOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
}

export interface ScenarioOption {
  text: string;
  isCorrect: boolean;
  feedback: string;
}

export interface ConnectionPair {
  term: string;
  match: string;
}

export interface AllocatorCategory {
  label: string;
  targetPercent: number; // e.g. 50
  startPercent: number; // e.g. 0
}

export interface LessonStep {
  id: string;
  // Added 'slider-allocator', 'text-selector', 'binary-choice'
  type: 'info' | 'question' | 'puzzle' | 'sorting' | 'fill-blank' | 'scenario' | 'connections' | 'slider-allocator' | 'text-selector' | 'binary-choice' | 'card-swipe';
  content: string;
  options?: LessonOption[];
  infoBlurb?: string;
  hint?: string;
  correctAnswerExplanation?: string;

  // For Puzzle Type
  puzzleWord?: string;
  scramble?: string;

  // For Sorting Type
  sortCorrectOrder?: string[];

  // For Fill Blank Type
  fillBlankCorrect?: string;
  fillBlankOptions?: string[];

  // For Scenario Type
  scenarioOptions?: ScenarioOption[];

  // For Connections Type
  connectionPairs?: ConnectionPair[];

  // For Slider Allocator
  allocatorCategories?: AllocatorCategory[];

  // For Text Selector
  selectorTargetPhrases?: string[]; // The words/phrases user needs to click

  // NEW: For Binary Choice
  binaryLeft?: { label: string, isCorrect: boolean, feedback: string };
  binaryRight?: { label: string, isCorrect: boolean, feedback: string };
}

export interface PlaybookDefinition {
  term: string;
  definition: string;
}

export interface PlaybookContent {
  summary: string;
  realLifeExample: string;
  definitions: PlaybookDefinition[];
  actionableSteps: string[];
}

export interface EducationModule {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  isCompleted: boolean;
  steps: LessonStep[];
  category: 'Basics' | 'Investing' | 'Taxes' | 'Business' | 'Credit' | 'Assets' | 'Economics' | 'Advanced';
  estimatedTime: string;
  playbook?: PlaybookContent;
}

// --- Report Types ---
export interface ReportData {
  id: string;
  fileName: string;
  uploadDate: string;
  period: string;
  type: 'PandL' | 'BalanceSheet';
  data: {
    revenue: number;
    cogs: number;
    grossProfit: number;
    expenses: { category: string; amount: number }[];
    netIncome: number;
    assets?: number;
    liabilities?: number;
    equity?: number;
  };
}

export interface ReportAnalysis {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  tips: string[];
}

// --- Auth Types ---
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface UserState {
  totalXp: number;
  level: number;
  streakDays: number;
  completedUnitIds: string[];
  inventory: string[];
  hasCompletedOnboarding: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  sources?: { uri: string; title: string }[];
}

export type Theme = 'light' | 'dark';

// --- Context Definition ---
export interface BankyContextType {
  // Auth
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  login: (rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateUserName: (name: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;

  // Data Read
  transactions: Transaction[];
  accounts: Account[];
  userState: UserState;
  budgets: Budget[];
  goals: Goal[];
  currency: Currency;

  // Data Write (Database Actions)
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  createAccount: (acc: Omit<Account, 'id'>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;

  updateBudget: (category: Category, limit: number) => Promise<void>;

  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (id: string, savedAmount: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  // Gamification Write
  addXp: (amount: number) => Promise<void>;
  unlockReward: (item: string) => Promise<void>;
  markUnitComplete: (unitId: string) => Promise<void>;

  // Education Region
  region: RegionCode;
  setRegion: (r: RegionCode) => void;

  // Daily Bonus
  showDailyBonus: boolean;
  closeDailyBonus: () => void;

  // Settings
  setCurrency: (c: Currency) => Promise<void>;

  // Theme
  theme: Theme;
  toggleTheme: () => void;
}
