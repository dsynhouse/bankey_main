import { supabase } from './supabase';

// Razorpay SDK loaded lazily when needed
let razorpayLoadPromise: Promise<void> | null = null;

/**
 * Lazy load Razorpay SDK on demand (not blocking initial page load)
 */
const loadRazorpaySDK = (): Promise<void> => {
    if (window.Razorpay) {
        return Promise.resolve();
    }

    if (!razorpayLoadPromise) {
        razorpayLoadPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
            document.body.appendChild(script);
        });
    }

    return razorpayLoadPromise;
};

interface RazorpayInstance {
    open: () => void;
    close: () => void;
    on: (event: string, callback: () => void) => void;
}

interface RazorpayConstructor {
    new(options: RazorpayOptions): RazorpayInstance;
}

declare global {
    interface Window {
        Razorpay: RazorpayConstructor;
    }
}

interface RazorpayOptions {
    key: string;
    subscription_id: string;
    name: string;
    description: string;
    image?: string;
    handler: (response: RazorpayPaymentResponse) => void;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    theme?: {
        color: string;
    };
    modal?: {
        ondismiss: () => void;
    };
}

interface RazorpayPaymentResponse {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
}

interface SubscriptionCreationResponse {
    subscriptionId: string;
    customerId?: string;
}

/**
 * Initiates Razorpay subscription checkout
 * 
 * @param userId - User ID from auth
 * @param userProfile - User profile for prefilling
 * @returns Promise that resolves when payment completes
 */
export const initiateSubscription = async (
    userId: string,
    userProfile?: { name: string; email: string }
): Promise<void> => {
    try {
        // Check for API Key first
        const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
        if (!keyId) {
            alert('Configuration Error: VITE_RAZORPAY_KEY_ID is missing in your environment variables.');
            throw new Error('Missing Razorpay Key ID');
        }

        // Step 1: Call Supabase Edge Function to create subscription
        const { data, error } = await supabase.functions.invoke<SubscriptionCreationResponse>(
            'create-subscription',
            {
                body: { userId }
            }
        );

        if (error) {
            console.error('Error creating subscription:', error);
            alert(`Subscription Error: ${error.message || 'Failed to initialize subscription.'}`);
            throw new Error('Failed to create subscription. Please try again.');
        }

        if (!data?.subscriptionId) {
            alert('Error: Invalid response from subscription server.');
            throw new Error('Invalid subscription response');
        }

        // Step 2: Open Razorpay checkout
        const options: RazorpayOptions = {
            key: keyId,
            subscription_id: data.subscriptionId,
            name: 'Bankey Premium',
            description: 'Monthly subscription - ₹149/month',
            image: '/logo.png', // Your app logo
            handler: async (response) => {
                // Payment successful - verify on backend
                await verifyPayment(response, userId);
            },
            prefill: {
                name: userProfile?.name,
                email: userProfile?.email
            },
            theme: {
                color: '#F59E0B' // Orange/yellow gradient color
            },
            modal: {
                ondismiss: () => {
                    console.log('Payment modal closed');
                }
            }
        };

        // Ensure Razorpay SDK is loaded (lazy load on first use)
        await loadRazorpaySDK();

        if (!window.Razorpay) {
            alert('Error: Razorpay SDK failed to load. Please check your internet connection and refresh.');
            throw new Error('Razorpay SDK not loaded. Please refresh the page.');
        }

        const razorpay = new window.Razorpay(options);
        razorpay.open();

    } catch (error) {
        console.error('Subscription initiation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        // Alert is already handled for specific cases, but catch-all for others
        if (!errorMessage.includes('Configuration Error') && !errorMessage.includes('Subscription Error')) {
            alert(`Unexpected Error: ${errorMessage}`);
        }
        throw error;
    }
};

/**
 * Verifies payment signature on backend
 * 
 * @param response - Razorpay payment response
 * @param userId - User ID
 */
const verifyPayment = async (
    response: RazorpayPaymentResponse,
    userId: string
): Promise<void> => {
    try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
            body: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
                userId
            }
        });

        if (error) {
            console.error('Payment verification failed:', error);
            throw new Error('Payment verification failed');
        }

        // Success! Premium activated
        console.log('Payment verified successfully:', data);

        // Reload user profile to reflect premium status
        // Reload user profile to reflect premium status
        // Redirect to success page for verification
        window.location.hash = '/payment-success';

    } catch (error) {
        console.error('Payment verification error:', error);
        throw error;
    }
};

/**
 * Cancels an active subscription
 * 
 * @param subscriptionId - Razorpay subscription ID
 */
export const cancelSubscription = async (subscriptionId: string): Promise<void> => {
    try {
        const { error } = await supabase.functions.invoke('cancel-subscription', {
            body: { subscriptionId }
        });

        if (error) {
            throw new Error('Failed to cancel subscription');
        }

        // Success message
        alert('Subscription cancelled successfully. Premium access will remain active until the end of your billing period.');

        // Reload to update UI
        window.location.reload();

    } catch (error) {
        console.error('Cancellation error:', error);
        throw error;
    }
};

/**
 * Fetches user's subscription details
 * 
 * @param userId - User ID
 * @returns Subscription details or null
 */
export const getUserSubscription = async (userId: string) => {
    try {
        // Query for subscriptions that are either 'active' or 'created' (payment in progress)
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .in('status', ['active', 'created'])
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error fetching subscription:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Get subscription error:', error);
        return null;
    }
};

/**
 * Fetches user's payment history
 * 
 * @param userId - User ID
 * @returns Array of payments
 */
export const getPaymentHistory = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching payment history:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Get payment history error:', error);
        return [];
    }
};
