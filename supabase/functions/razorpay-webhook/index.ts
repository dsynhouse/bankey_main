// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts'

serve(async (req) => {
    try {
        const body = await req.text()
        const signature = req.headers.get('x-razorpay-signature')

        if (!signature) {
            return new Response('Missing signature', { status: 401 })
        }

        // Verify webhook signature
        const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')
        if (!webhookSecret) {
            throw new Error('Webhook secret not configured')
        }

        const expectedSignature = createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex')

        if (signature !== expectedSignature) {
            console.error('Invalid signature')
            return new Response('Invalid signature', { status: 401 })
        }

        // Parse event
        const event = JSON.parse(body)
        console.log('Webhook event:', event.event)

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        // Handle different events
        switch (event.event) {
            case 'subscription.charged':
                await handleSubscriptionCharged(event, supabase)
                break

            case 'subscription.activated':
                await handleSubscriptionActivated(event, supabase)
                break

            case 'subscription.cancelled':
                await handleSubscriptionCancelled(event, supabase)
                break

            case 'subscription.completed':
            case 'subscription.halted':
            case 'subscription.expired':
                await handleSubscriptionEnded(event, supabase)
                break

            default:
                console.log('Unhandled event type:', event.event)
        }

        return new Response('OK', { status: 200 })

    } catch (error) {
        console.error('Webhook error:', error)
        return new Response('Error', { status: 500 })
    }
})

async function handleSubscriptionCharged(event: any, supabase: any) {
    const subscription = event.payload.subscription.entity
    const payment = event.payload.payment.entity
    const userId = subscription.notes?.user_id

    if (!userId) {
        console.error('No user_id in subscription notes')
        return
    }

    // Record payment
    await supabase.from('payments').insert({
        user_id: userId,
        razorpay_payment_id: payment.id,
        razorpay_order_id: payment.order_id,
        amount: payment.amount / 100, // Convert paise to rupees
        currency: payment.currency,
        status: payment.status === 'captured' ? 'captured' : 'pending'
    })

    // Update user premium status
    const expiresAt = new Date(subscription.current_end * 1000).toISOString()

    await supabase.from('profiles').update({
        is_premium: true,
        premium_expires_at: expiresAt
    }).eq('id', userId)

    console.log(`User ${userId} premium activated until ${expiresAt}`)
}

async function handleSubscriptionActivated(event: any, supabase: any) {
    const subscription = event.payload.subscription.entity
    const userId = subscription.notes?.user_id

    if (!userId) return

    // Update subscription status
    await supabase.from('subscriptions')
        .update({
            status: 'active',
            current_period_start: new Date(subscription.current_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_end * 1000).toISOString()
        })
        .eq('razorpay_subscription_id', subscription.id)

    // Ensure user is premium
    await supabase.from('profiles').update({
        is_premium: true,
        premium_expires_at: new Date(subscription.current_end * 1000).toISOString()
    }).eq('id', userId)
}

async function handleSubscriptionCancelled(event: any, supabase: any) {
    const subscription = event.payload.subscription.entity

    // Update subscription - mark for cancellation at period end
    await supabase.from('subscriptions')
        .update({
            status: 'cancelled',
            cancel_at_period_end: true
        })
        .eq('razorpay_subscription_id', subscription.id)

    console.log(`Subscription ${subscription.id} cancelled, will end at period end`)
}

async function handleSubscriptionEnded(event: any, supabase: any) {
    const subscription = event.payload.subscription.entity
    const userId = subscription.notes?.user_id

    if (!userId) return

    // Update subscription status
    await supabase.from('subscriptions')
        .update({ status: 'expired' })
        .eq('razorpay_subscription_id', subscription.id)

    // Remove premium status
    await supabase.from('profiles').update({
        is_premium: false,
        premium_expires_at: null
    }).eq('id', userId)

    console.log(`User ${userId} premium expired`)
}
