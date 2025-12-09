// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts'

serve(async (req) => {
    const startTime = Date.now()

    try {
        // CORS headers
        if (req.method === 'OPTIONS') {
            return new Response('ok', {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST',
                    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
                }
            })
        }

        const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature, userId } = await req.json()

        console.log(`[${new Date().toISOString()}] Payment verification started:`, {
            razorpay_payment_id,
            razorpay_subscription_id,
            userId
        })

        // Validate required parameters
        if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature || !userId) {
            console.error('[VERIFY-PAYMENT] Missing parameters:', { razorpay_payment_id, razorpay_subscription_id, userId })
            return new Response(
                JSON.stringify({ error: 'Missing required parameters' }),
                { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
            )
        }

        // Verify signature
        const secret = Deno.env.get('RAZORPAY_SECRET')
        if (!secret) {
            console.error('[VERIFY-PAYMENT] RAZORPAY_SECRET not configured')
            return new Response(
                JSON.stringify({ error: 'Server configuration error' }),
                { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
            )
        }

        const expectedSignature = createHmac('sha256', secret)
            .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
            .digest('hex')

        if (razorpay_signature !== expectedSignature) {
            console.error('[VERIFY-PAYMENT] Signature mismatch:', {
                received: razorpay_signature,
                expected: expectedSignature
            })
            return new Response(
                JSON.stringify({ error: 'Payment verification failed - invalid signature' }),
                { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
            )
        }

        console.log('[VERIFY-PAYMENT] Signature verified ✓')

        // Initialize Supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        // Step 1: Fetch subscription internal ID (needed for FK)
        console.log('[VERIFY-PAYMENT] Fetching subscription from DB...')
        const { data: subData, error: fetchError } = await supabase
            .from('subscriptions')
            .select('id, user_id')
            .eq('razorpay_subscription_id', razorpay_subscription_id)
            .single()

        if (fetchError || !subData) {
            console.error('[VERIFY-PAYMENT] Subscription not found in DB:', fetchError)
            return new Response(
                JSON.stringify({ error: 'Subscription not found. Please contact support.' }),
                { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
            )
        }

        // Verify userId matches
        if (subData.user_id !== userId) {
            console.error('[VERIFY-PAYMENT] User ID mismatch:', { expected: subData.user_id, received: userId })
            return new Response(
                JSON.stringify({ error: 'User verification failed' }),
                { status: 403, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
            )
        }

        console.log('[VERIFY-PAYMENT] Subscription found ✓ ID:', subData.id)

        // Step 2: Update subscription status to 'active'
        console.log('[VERIFY-PAYMENT] Activating subscription...')
        const { error: subUpdateError } = await supabase.from('subscriptions')
            .update({
                status: 'active',
                razorpay_payment_id: razorpay_payment_id,
                updated_at: new Date().toISOString()
            })
            .eq('id', subData.id)

        if (subUpdateError) {
            console.error('[VERIFY-PAYMENT] Failed to update subscription:', subUpdateError)
            return new Response(
                JSON.stringify({ error: 'Failed to activate subscription' }),
                { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
            )
        }

        console.log('[VERIFY-PAYMENT] Subscription activated ✓')

        // Step 3: Record payment (single insert, with FK)
        console.log('[VERIFY-PAYMENT] Recording payment...')
        const { error: paymentError } = await supabase.from('payments').insert({
            user_id: userId,
            subscription_id: subData.id,
            razorpay_payment_id: razorpay_payment_id,
            amount: 149.00,
            currency: 'INR',
            status: 'captured'
        })

        if (paymentError) {
            // Log but don't fail - payment record is secondary
            console.error('[VERIFY-PAYMENT] Payment record insert failed (non-critical):', paymentError)
        } else {
            console.log('[VERIFY-PAYMENT] Payment recorded ✓')
        }

        // Step 4: Activate premium on profile (CRITICAL)
        console.log('[VERIFY-PAYMENT] Activating premium status...')
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30)

        const { error: profileError } = await supabase.from('profiles').upsert({
            id: userId,
            is_premium: true,
            premium_expires_at: expiresAt.toISOString()
        }, {
            onConflict: 'id'
        })

        if (profileError) {
            console.error('[VERIFY-PAYMENT] CRITICAL: Failed to activate premium on profile:', profileError)
            return new Response(
                JSON.stringify({ error: 'Failed to activate premium. Payment received but activation failed. Contact support with payment ID: ' + razorpay_payment_id }),
                { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
            )
        }

        const elapsed = Date.now() - startTime
        console.log(`[VERIFY-PAYMENT] SUCCESS ✓ Premium activated for user ${userId} in ${elapsed}ms`)

        return new Response(
            JSON.stringify({
                success: true,
                userId: userId,
                expiresAt: expiresAt.toISOString()
            }),
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        )

    } catch (error: any) {
        const elapsed = Date.now() - startTime
        console.error(`[VERIFY-PAYMENT] FATAL ERROR after ${elapsed}ms:`, error)
        return new Response(
            JSON.stringify({ error: 'Payment verification failed: ' + (error.message || 'Unknown error') }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        )
    }
})
