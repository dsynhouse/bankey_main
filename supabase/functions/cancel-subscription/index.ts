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

        const { subscriptionId } = await req.json()

        if (!subscriptionId) {
            return new Response(
                JSON.stringify({ error: 'Subscription ID is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
            )
        }

        // Get Razorpay credentials
        const keyId = Deno.env.get('RAZORPAY_KEY_ID')
        const keySecret = Deno.env.get('RAZORPAY_SECRET')

        if (!keyId || !keySecret) {
            return new Response(
                JSON.stringify({ error: 'Configuration Error: Razorpay credentials missing' }),
                { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
            )
        }

        const auth = btoa(`${keyId}:${keySecret}`)

        // Cancel subscription via Razorpay API
        const razorpayResponse = await fetch(`https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cancel_at_cycle_end: 1 // Cancel at end of billing cycle
            })
        })

        if (!razorpayResponse.ok) {
            const errorData = await razorpayResponse.json()
            console.error('Razorpay cancel error:', errorData)
            return new Response(
                JSON.stringify({ error: 'Failed to cancel subscription on Razorpay', details: errorData }),
                { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
            )
        }

        const cancelData = await razorpayResponse.json()
        console.log('Subscription cancelled:', cancelData)

        // Update Supabase subscription status
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        await supabase
            .from('subscriptions')
            .update({
                status: 'active', // Keep active until period ends
                cancel_at_period_end: true
            })
            .eq('razorpay_subscription_id', subscriptionId)

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Subscription cancelled successfully',
                ends_at: cancelData.current_end ? new Date(cancelData.current_end * 1000).toISOString() : null
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        )

    } catch (error) {
        console.error('Cancel subscription error:', error)
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
            { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        )
    }
})
