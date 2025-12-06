/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_KEY: string;
    readonly VITE_RAZORPAY_KEY_ID: string;
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    readonly VITE_SENTRY_DSN?: string; // Optional for local dev
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
