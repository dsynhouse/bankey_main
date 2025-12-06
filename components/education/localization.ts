/**
 * Education localization utilities.
 * Handles regional content adaptation for different countries.
 */

import { RegionCode } from '../../types';

// Dictionary for regional term replacements
export const LOCALIZATION_MAP: Record<RegionCode, Record<string, string>> = {
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
        'CURRENCY_SYMBOL': '£',
        'TAX_AGENCY': 'HMRC',
        'RETIREMENT_ACC': 'Pension',
        'TAX_FREE_ACC': 'ISA',
        'CREDIT_SCORE': 'Credit Score',
        'INDEX_FUND': 'FTSE 100',
        'ID_NUM': 'NI Number',
        'TAX_SECTION': 'Personal Allowance',
        'CENTRAL_BANK': 'Bank of England',
        'ESTATE_LAW': 'Probate'
    },
    'EU': {
        'CURRENCY_SYMBOL': '€',
        'TAX_AGENCY': 'Tax Authority',
        'RETIREMENT_ACC': 'Pension',
        'TAX_FREE_ACC': 'Savings Acc',
        'CREDIT_SCORE': 'Credit Score',
        'INDEX_FUND': 'Stoxx 50',
        'ID_NUM': 'Tax ID',
        'TAX_SECTION': 'Deductions',
        'CENTRAL_BANK': 'ECB',
        'ESTATE_LAW': 'Succession'
    }
};

/**
 * Adapts content text by replacing US-centric terms with region-specific ones.
 */
export const adaptContent = (text: string, region: RegionCode): string => {
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

/**
 * Loot table for reward drops after completing lessons.
 */
export const LOOT_TABLE = [
    { id: 'coin_bronze', name: 'Bronze Coin', emoji: '🥉', rarity: 'Common' },
    { id: 'coin_silver', name: 'Silver Coin', emoji: '🥈', rarity: 'Common' },
    { id: 'piggy', name: 'Savings Pig', emoji: '🐷', rarity: 'Common' },
    { id: 'chart', name: 'Stonk Up', emoji: '📈', rarity: 'Uncommon' },
    { id: 'bull', name: 'Bull Market', emoji: '🐂', rarity: 'Uncommon' },
    { id: 'diamond', name: 'Diamond Hands', emoji: '💎', rarity: 'Rare' },
    { id: 'bag', name: 'Secure The Bag', emoji: '💰', rarity: 'Rare' },
    { id: 'rocket', name: 'Moon Shot', emoji: '🚀', rarity: 'Legendary' },
] as const;

export type LootItem = typeof LOOT_TABLE[number];
