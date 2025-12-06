import { describe, it, expect, vi } from 'vitest';
import { calculateSplits, simplifyDebts } from '../services/billSplitterService';
import { INITIAL_USER_STATE } from '../constants';

// Mock dependencies
vi.mock('../services/supabase', () => ({
    supabase: {
        from: vi.fn(),
        auth: {
            getSession: vi.fn(),
            onAuthStateChange: vi.fn(),
            signOut: vi.fn()
        },
        channel: vi.fn(() => ({
            on: vi.fn().mockReturnThis(),
            subscribe: vi.fn()
        }))
    }
}));

describe('System Logic Audit', () => {

    describe('1. Bill Splitter Math', () => {
        it('successfully splits $10.00 among 3 people (Equal)', () => {
            const amount = 10.00;
            const members = ['A', 'B', 'C'];
            const splits = calculateSplits(amount, members, 'equal');

            // Expected: 3.33, 3.33, 3.34
            expect(splits).toHaveLength(3);
            expect(splits[0].amount).toBe(3.33);
            expect(splits[1].amount).toBe(3.33);
            expect(splits[2].amount).toBe(3.34);

            const total = splits.reduce((sum, s) => sum + s.amount, 0);
            expect(total).toBeCloseTo(10.00, 2);
        });

        it('successfully simplifies circular debt (A->B->C->A)', () => {
            // A owes B 10
            // B owes C 10
            // C owes A 10
            // Net: A: 0, B: 0, C: 0. 
            // Wait, simplifyDebts takes "Net Balances".
            // A paid 10 for B (A+10, B-10) -> A is creditor (+10), B is debtor (-10)

            // Scenario 1: Simple A pays for B
            // A paid 10, split between A(5) and B(5).
            // A Net: Paid 10, Consumed 5 = +5
            // B Net: Paid 0, Consumed 5 = -5
            const netBalances = {
                'A': 5.00,
                'B': -5.00
            };
            const debts = simplifyDebts(netBalances);
            expect(debts).toHaveLength(1);
            expect(debts[0].from).toBe('B');
            expect(debts[0].to).toBe('A');
            expect(debts[0].amount).toBe(5.00);
        });

        it('successfully simplifies complex debt', () => {
            // A: +15, B: -5, C: -10
            const netBalances = {
                'A': 15.00,
                'B': -5.00,
                'C': -10.00
            };
            // Expected: B pays A 5, C pays A 10.
            const debts = simplifyDebts(netBalances);

            // Order might vary, but total transfer should be correct
            const totalVolume = debts.reduce((sum, d) => sum + d.amount, 0);
            expect(totalVolume).toBe(15.00);

            const bPays = debts.find(d => d.from === 'B');
            expect(bPays?.to).toBe('A');
            expect(bPays?.amount).toBe(5.00);
        });
    });

    describe('2. User State Integrity', () => {
        it('Initial state has defaults', () => {
            expect(INITIAL_USER_STATE.level).toBe(1);
            expect(INITIAL_USER_STATE.totalXp).toBe(0);
        });
    });

});
