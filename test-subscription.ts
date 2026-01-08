
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = 'https://nauoinujfduhsahdbdbp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hdW9pbnVqZmR1aHNhaGRiZGJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NjQ1NjAsImV4cCI6MjA4MzQ0MDU2MH0.OMttgtCFJDZO98p020eF0mOQEbz3EjjM0PSSkP0PN_M';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSubscription() {
    console.log('Testing create-subscription...');
    const startTime = Date.now();

    try {
        const { data, error } = await supabase.functions.invoke('create-subscription', {
            body: { userId: 'test-user-id-123' }
        });

        const duration = Date.now() - startTime;
        console.log(`Request took ${duration}ms`);

        if (error) {
            console.error('❌ Error response:', error);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }
        } else {
            console.log('✅ Success response:', data);
        }
    } catch (err) {
        console.error('❌ Unexpected fetch error:', err);
    }
}

testSubscription();
