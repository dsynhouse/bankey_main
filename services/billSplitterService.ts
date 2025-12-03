import { Member, Expense, Debt, SplitDetail } from '../types';

/**
 * Calculates the net balance for each member in a group based on expenses.
 * Positive balance = Owed money (Receiver)
 * Negative balance = Owes money (Giver)
 */
export const calculateNetBalances = (members: Member[], expenses: Expense[]): Record<string, number> => {
    const balances: Record<string, number> = {};

    // Initialize balances
    members.forEach(m => {
        balances[m.id] = 0;
    });

    expenses.forEach(expense => {
        const payerId = expense.paidBy;
        const amount = expense.amount;

        // Payer +Amount (they paid, so they are owed this amount initially)
        balances[payerId] = (balances[payerId] || 0) + amount;

        // Subtract each person's share (they owe this amount)
        expense.splitDetails.forEach(split => {
            balances[split.memberId] = (balances[split.memberId] || 0) - split.amount;
        });
    });

    return balances;
};

/**
 * Simplifies debts using a greedy algorithm to minimize transactions.
 * Matches the biggest debtor with the biggest creditor.
 */
export const simplifyDebts = (netBalances: Record<string, number>): Debt[] => {
    const debtors: { id: string, amount: number }[] = [];
    const creditors: { id: string, amount: number }[] = [];

    Object.entries(netBalances).forEach(([id, amount]) => {
        // Round to 2 decimals to avoid floating point errors
        const rounded = Math.round(amount * 100) / 100;
        if (rounded < -0.01) debtors.push({ id, amount: rounded }); // Negative balance = Debtor
        else if (rounded > 0.01) creditors.push({ id, amount: rounded }); // Positive balance = Creditor
    });

    // Sort by magnitude (descending)
    debtors.sort((a, b) => a.amount - b.amount); // Most negative first (e.g. -100, -50)
    creditors.sort((a, b) => b.amount - a.amount); // Most positive first (e.g. 100, 50)

    const debts: Debt[] = [];
    let i = 0; // Debtor index
    let j = 0; // Creditor index

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        // The amount to settle is the minimum of what the debtor owes and what the creditor is owed
        const amount = Math.min(Math.abs(debtor.amount), creditor.amount);

        // Round amount to 2 decimals
        const roundedAmount = Math.round(amount * 100) / 100;

        if (roundedAmount > 0) {
            debts.push({
                from: debtor.id,
                to: creditor.id,
                amount: roundedAmount
            });
        }

        // Adjust remaining balances
        debtor.amount += roundedAmount;
        creditor.amount -= roundedAmount;

        // If settled (close to 0), move to next
        if (Math.abs(debtor.amount) < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    return debts;
};

/**
 * Helper to calculate split details based on method
 */
export const calculateSplits = (
    amount: number,
    memberIds: string[],
    method: 'equal' | 'percentage',
    customPercentages?: { [memberId: string]: number }
): SplitDetail[] => {
    if (method === 'percentage' && customPercentages) {
        let distributed = 0;
        return memberIds.map((id, index) => {
            const pct = customPercentages[id] || 0;
            let share = Math.floor((amount * (pct / 100)) * 100) / 100;

            if (index === memberIds.length - 1) {
                // Adjust last person to ensure total matches exactly (handling rounding errors)
                share = Math.round((amount - distributed) * 100) / 100;
            }
            distributed += share;

            return {
                memberId: id,
                amount: share,
                percentage: pct
            };
        });
    }

    // Default: Equal Split
    const count = memberIds.length;
    if (count === 0) return [];
    const splitAmount = amount / count;

    let distributed = 0;
    return memberIds.map((id, index) => {
        let share = Math.floor(splitAmount * 100) / 100;
        if (index === memberIds.length - 1) {
            // Last person gets the remainder to ensure exact sum
            share = Math.round((amount - distributed) * 100) / 100;
        }
        distributed += share;

        return {
            memberId: id,
            amount: share
        };
    });
};
