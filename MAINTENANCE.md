# 🛡️ Bankey Maintenance & Prevention Guide

To ensure the Bankey platform remains stable and bug-free, follow these strict protocols.

## 1. The "Golden Rule" of AI Models
**NEVER** use "experimental" or "lite" models for critical features without isolated testing.
- **Approved Model**: `gemini-2.5-flash` (Stable, High Quota)
- **Forbidden Models**: `gemini-2.0-flash-lite` (Restricted), `gemini-pro-preview` (Unstable)

## 2. API Safety Protocols
The codebase now enforces "Robust Error Handling". Any future API verification must adhere to:
- **Exponential Backoff**: `1s -> 2s -> 4s` delay pattern.
- **Jitter**: Random usage of `Math.random()` to desynchronize retries.
- **Passive Monitoring**: Never trigger `checkGeminiStatus(true)` automatically on error.

## 3. Deployment Checklist
Before every deployment, run the Health Check:
```bash
npm run health-check
```

## 4. Troubleshooting Decision Tree
If users report "429" or "AI Pending":
1.  **Check Vercel Deployment**: Ensure the latest commit is live.
2.  **Clear Cache**: Code updates often require client-side cache clearing.
3.  **Run Health Check**: Use the script to ping the API directly.
