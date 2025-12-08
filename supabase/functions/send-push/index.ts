import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { title, message, segment } = await req.json();

        const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID') || '3e6289ef-e608-4935-bac6-41ef435f9e4e';
        const ONESIGNAL_REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY');

        if (!ONESIGNAL_REST_API_KEY) {
            throw new Error('Missing ONESIGNAL_REST_API_KEY');
        }

        const payload: any = {
            app_id: ONESIGNAL_APP_ID,
            contents: { en: message },
            headings: { en: title },
        };

        if (segment === 'All') {
            payload.included_segments = ['All'];
        } else if (segment === 'Active Users') {
            payload.included_segments = ['Active Users'];
        } else if (segment === 'Inactive Users') {
            payload.included_segments = ['Inactive Users'];
        } else {
            // Default to All if unknown
            payload.included_segments = ['All'];
        }

        const response = await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${ONESIGNAL_REST_API_KEY}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.errors) {
            return new Response(JSON.stringify({ errors: data.errors }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
