// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

serve(async (req) => {
    try {
        // 1. Handle CORS Preflight
        if (req.method === 'OPTIONS') {
            return new Response('ok', {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST',
                    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
                }
            });
        }

        // 2. Parse Input
        const { prompt, contents, config, model = 'gemini-2.5-flash' } = await req.json();

        if (!prompt && !contents) {
            return new Response(JSON.stringify({ error: 'Prompt or contents required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        // 3. Get API Key from Secrets (Secure)
        const apiKey = Deno.env.get('GEMINI_API_KEY');
        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Server Config Error: Missing GEMINI_API_KEY' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        // Prepare Request Body
        let requestBody;
        if (contents) {
            // Advanced: Pass full contents (text + image/audio) + config (schema)
            requestBody = {
                contents: contents,
                generationConfig: config || { temperature: 0.7 }
            };
        } else {
            // Simple Prompt
            requestBody = {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7 }
            };
        }

        // 4. Call Gemini API (REST)
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API Error:', errorText);

            // Handle HTTP 503 (Overloaded) specifically 
            if (response.status === 503) {
                return new Response(JSON.stringify({ error: 'AI Service Overloaded', details: errorText }), {
                    status: 503,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                });
            }

            return new Response(JSON.stringify({ error: `Gemini API Error: ${response.status}`, details: errorText }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        const data = await response.json();
        // Return full data so client can parse structured output or text
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // 5. Return Result (Supports both simple text and raw response)
        return new Response(JSON.stringify({
            text: generatedText, // Convenience
            data: data // Full Raw Response (for JSON parsing)
        }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // 5. Return Result
        return new Response(JSON.stringify({ text: generatedText }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });

    } catch (err) {
        console.error('Proxy Error:', err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
});
