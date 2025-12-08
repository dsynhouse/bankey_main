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
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

export const DEFAULT_CURRENCY: Currency = SUPPORTED_CURRENCIES[0];
