// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts'

serve(async (req) => {
    try {
        const body = await req.text()
        const signature = req.headers.get('x-razorpay-signature')

        console.log(`[${new Date().toISOString()}] Webhook received:`, req.headers.get('x-razorpay-event-id'))

        if (!signature) {
            console.error('[WEBHOOK] Missing signature')
            return new Response('Missing signature', { status: 401 })
        }

        // Verify webhook signature
        const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')
        if (!webhookSecret) {
            console.error('[WEBHOOK] Webhook secret not configured')
            return new Response('Configuration error', { status: 500 })
        }

        const expectedSignature = createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex')

        if (signature !== expectedSignature) {
            console.error('[WEBHOOK] Invalid signature')
            return new Response('Invalid signature', { status: 401 })
        }

        // Parse event
        const event = JSON.parse(body)
        console.log(`[WEBHOOK] Event validated: ${event.event}`)

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
                console.log('[WEBHOOK] Unhandled event type:', event.event)
        }

        console.log('[WEBHOOK] Event processed successfully ✓')
        return new Response('OK', { status: 200 })

    } catch (error) {
        console.error('[WEBHOOK] Fatal error:', error)
        return new Response('Error', { status: 500 })
    }
})

async function handleSubscriptionCharged(event: any, supabase: any) {
    const subscription = event.payload.subscription.entity
    const payment = event.payload.payment.entity
    const userId = subscription.notes?.user_id

    console.log(`[WEBHOOK] Processing subscription.charged for user ${userId}`)

    if (!userId) {
        console.error('[WEBHOOK] No user_id in subscription notes')
        return
    }

    // Fetch subscription internal ID for FK
    const { data: subData } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('razorpay_subscription_id', subscription.id)
        .single()

    if (!subData) {
        console.error('[WEBHOOK] Subscription not found in DB:', subscription.id)
        return
    }

    // IDEMPOTENT: Check if payment already recorded
    const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('razorpay_payment_id', payment.id)
        .maybeSingle()

    if (!existingPayment) {
        // Record payment
        const { error: paymentError } = await supabase.from('payments').insert({
            user_id: userId,
            subscription_id: subData.id,
            razorpay_payment_id: payment.id,
            razorpay_order_id: payment.order_id,
            amount: payment.amount / 100, // Convert paise to rupees
            currency: payment.currency,
            status: payment.status === 'captured' ? 'captured' : 'pending'
        })

        if (paymentError) {
            console.error('[WEBHOOK] Payment insert failed:', paymentError)
        } else {
            console.log('[WEBHOOK] Payment recorded ✓')
        }
    } else {
        console.log('[WEBHOOK] Payment already recorded (idempotent skip)')
    }

    // Update user premium status
    const expiresAt = new Date(subscription.current_end * 1000).toISOString()

    const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        is_premium: true,
        premium_expires_at: expiresAt
    }, {
        onConflict: 'id'
    })

    if (profileError) {
        console.error('[WEBHOOK] Profile update failed:', profileError)
    } else {
        console.log(`[WEBHOOK] User ${userId} premium activated until ${expiresAt} ✓`)
    }
}

async function handleSubscriptionActivated(event: any, supabase: any) {
    const subscription = event.payload.subscription.entity
    const userId = subscription.notes?.user_id

    console.log(`[WEBHOOK] Processing subscription.activated for user ${userId}`)

    if (!userId) {
        console.error('[WEBHOOK] No user_id in notes')
        return
    }

    // Update subscription status
    const { error: subError } = await supabase.from('subscriptions')
        .update({
            status: 'active',
            current_period_start: new Date(subscription.current_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('razorpay_subscription_id', subscription.id)

    if (subError) {
        console.error('[WEBHOOK] Subscription update failed:', subError)
    }

    // Ensure user is premium
    const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        is_premium: true,
        premium_expires_at: new Date(subscription.current_end * 1000).toISOString()
    }, {
        onConflict: 'id'
    })

    if (profileError) {
        console.error('[WEBHOOK] Profile update failed:', profileError)
    } else {
        console.log('[WEBHOOK] Subscription activated ✓')
    }
}

async function handleSubscriptionCancelled(event: any, supabase: any) {
    const subscription = event.payload.subscription.entity

    console.log(`[WEBHOOK] Processing subscription.cancelled: ${subscription.id}`)

    // Update subscription - mark for cancellation at period end
    const { error } = await supabase.from('subscriptions')
        .update({
            status: 'cancelled',
            cancel_at_period_end: true,
            updated_at: new Date().toISOString()
        })
        .eq('razorpay_subscription_id', subscription.id)

    if (error) {
        console.error('[WEBHOOK] Cancellation update failed:', error)
    } else {
        console.log(`[WEBHOOK] Subscription ${subscription.id} cancelled, will end at period end ✓`)
    }
}

async function handleSubscriptionEnded(event: any, supabase: any) {
    const subscription = event.payload.subscription.entity
    const userId = subscription.notes?.user_id

    console.log(`[WEBHOOK] Processing subscription ended for user ${userId}`)

    if (!userId) {
        console.error('[WEBHOOK] No user_id in notes')
        return
    }

    // Update subscription status
    const { error: subError } = await supabase.from('subscriptions')
        .update({
            status: 'expired',
            updated_at: new Date().toISOString()
        })
        .eq('razorpay_subscription_id', subscription.id)

    if (subError) {
        console.error('[WEBHOOK] Subscription update failed:', subError)
    }

    // Remove premium status
    const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        is_premium: false,
        premium_expires_at: null
    }, {
        onConflict: 'id'
    })

    if (profileError) {
        console.error('[WEBHOOK] Profile update failed:', profileError)
    } else {
        console.log(`[WEBHOOK] User ${userId} premium expired ✓`)
    }
}
