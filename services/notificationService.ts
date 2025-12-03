import { Member, Expense } from '../types';

/**
 * Simulates sending a notification to a member.
 * In a real app, this would call a backend API (Email/SMS).
 * For now, it logs to console and returns a message for UI display.
 */
export const notifyMember = (member: Member, subject: string, message: string): void => {
    if (!member.email && !member.phone) {
        console.log(`[Notification Skipped] No contact info for ${member.name}`);
        return;
    }

    console.log(`[Notification Sent] To: ${member.name} (${member.email || member.phone})`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);

    // In a real app, we might trigger a toast here or return a success status.
};

/**
 * Generates a notification message for a new expense.
 */
export const generateExpenseNotification = (expense: Expense, member: Member, share: number): string => {
    return `Hi ${member.name}, you've been added to a new expense "${expense.description}". Your share is ${share}.`;
};

/**
 * Generates a notification message for a debt settlement.
 */
export const generateSettlementNotification = (from: Member, to: Member, amount: number): string => {
    return `Hi ${to.name}, ${from.name} has settled their debt of ${amount} with you.`;
};

/**
 * Helper to generate a mailto link for manual notification
 */
export const getMailtoLink = (member: Member, subject: string, body: string): string | null => {
    if (!member.email) return null;
    return `mailto:${member.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
