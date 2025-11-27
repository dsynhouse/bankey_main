import { UserState, Currency } from './types';

export const INITIAL_USER_STATE: UserState = {
    totalXp: 0,
    level: 1,
    streakDays: 1,
    completedUnitIds: [],
    inventory: [],
    hasCompletedOnboarding: false
};

export const SUPPORTED_CURRENCIES: Currency[] = [
    { code: 'USD', symbol: '$', name: 'United States Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

export const DEFAULT_CURRENCY: Currency = SUPPORTED_CURRENCIES[0];
