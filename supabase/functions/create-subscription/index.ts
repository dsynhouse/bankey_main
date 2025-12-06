// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'



serve(async (req) => {
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

        const { userId } = await req.json()

        if (!userId) {
            return new Response(
                JSON.stringify({ error: 'User ID is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
            )
        }

        // Check Secrets
        const keyId = Deno.env.get('RAZORPAY_KEY_ID')
        const keySecret = Deno.env.get('RAZORPAY_SECRET')
        const planId = Deno.env.get('RAZORPAY_PLAN_ID')

        if (!keyId || !keySecret || !planId) {
            return new Response(
                JSON.stringify({ error: 'Configuration Error: RAZORPAY_KEY_ID, RAZORPAY_SECRET, or RAZORPAY_PLAN_ID is missing in Supabase secrets.' }),
                { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
            )
        }

        const auth = btoa(`${keyId}:${keySecret}`)

        // Create subscription via Razorpay API
        const razorpayResponse = await fetch('https://api.razorpay.com/v1/subscriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                plan_id: planId,
                total_count: 120, // 10 years (UPI has 30-year limit)
                customer_notify: 1,
                notes: {
                    user_id: userId
                }
            })
        })

        if (!razorpayResponse.ok) {
            const errorText = await razorpayResponse.text()
            console.error('Razorpay API error:', errorText)
            return new Response(
                JSON.stringify({ error: `Razorpay API error: ${errorText}` }),
                { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
            )
        }

        const subscription = await razorpayResponse.json()

        // Store subscription in database
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        const { error: dbError } = await supabase
            .from('subscriptions')
            .insert({
                user_id: userId,
                razorpay_subscription_id: subscription.id,
                razorpay_customer_id: subscription.customer_id,
                plan_id: planId,
                status: 'created',
                current_period_start: subscription.current_start ? new Date(subscription.current_start * 1000).toISOString() : null,
                current_period_end: subscription.current_end ? new Date(subscription.current_end * 1000).toISOString() : null,
            })

        if (dbError) {
            console.error('Database error:', dbError)
            return new Response(
                JSON.stringify({ error: `Database error: ${dbError.message}` }),
                { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
            )
        }

        return new Response(
            JSON.stringify({
                subscriptionId: subscription.id,
                customerId: subscription.customer_id
            }),
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        )

    } catch (error) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
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
