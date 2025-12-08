import OneSignal from 'react-onesignal';
import { Member, Expense } from '../types';
import { supabase } from './supabase';

// --- NEW ONESIGNAL NOTIFICATIONS (ADMIN) ---
const ONESIGNAL_APP_ID = '3e6289ef-e608-4935-bac6-41ef435f9e4e';

export const initOneSignal = async () => {
    try {
        await OneSignal.init({
            appId: ONESIGNAL_APP_ID,
            allowLocalhostAsSecureOrigin: true, // Helpful for dev
            notifyButton: {
                enable: true,
                prenotify: true,
                showCredit: false,
                text: {
                    'tip.state.unsubscribed': 'Subscribe to notifications',
                    'tip.state.subscribed': "You are subscribed to notifications",
                    'tip.state.blocked': "You have blocked notifications",
                    'message.prenotify': 'Click to subscribe to notifications',
                    'message.action.subscribed': "Thanks for subscribing!",
                    'message.action.resubscribed': "You're subscribed to notifications",
                    'message.action.subscribing': "Subscribing...",
                    'message.action.unsubscribed': "You won't receive notifications again",
                    'dialog.main.title': 'Manage Notifications',
                    'dialog.main.button.subscribe': 'SUBSCRIBE',
                    'dialog.main.button.unsubscribe': 'UNSUBSCRIBE',
                    'dialog.blocked.title': 'Unblock Notifications',
                    'dialog.blocked.message': "Follow these instructions to allow notifications:"
                }
            },
        });
        console.log('OneSignal Initialized');
    } catch (error) {
        console.error('OneSignal Init Error:', error);
    }
};

export const requestNotificationPermission = async () => {
    try {
        await OneSignal.Slidedown.promptPush();
    } catch (error) {
        console.error('Permission Request Error:', error);
    }
};

export const sendNotification = async (title: string, message: string, segment: string = 'All') => {
    console.log(`[SENDING] Title: ${title}, Msg: ${message}, Segment: ${segment}`);

    // Call Supabase Edge Function to bypass CORS and hide API Key
    const { data, error } = await supabase.functions.invoke('send-push', {
        body: { title, message, segment }
    });

    if (error) {
        throw new Error(error.message || 'Failed to trigger Edge Function');
    }

    if (data && data.errors) {
        throw new Error(JSON.stringify(data.errors));
    }

    return { success: true, message: 'Notification Sent!' };
};


// --- LEGACY BILL SPLITTER NOTIFICATIONS ---

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
