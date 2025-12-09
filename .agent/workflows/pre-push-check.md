---
description: Mandatory Pre-Push Verification Protocol
---
# Pre-Push Verification Workflow

**CRITICAL:** This workflow MUST be executed before ANY `git push` command. No exceptions.

1.  **Type Check**
    - Run: `npx tsc --noEmit`
    - Goal: Ensure no TypeScript errors (unreachable code, type mismatches).

2.  **Production Build**
    - Run: `npm run build`
    - Goal: Ensure the app compiles for production. This catches React runtime crashes, missing imports, and bundle issues that `tsc` might miss.

3.  **Unit Tests**
    - Run: `npm test`
    - Goal: Verify core logic and components pass defined tests.

**If ANY step fails:**
- 🛑 STOP. Do not push.
- 🔧 Fix the error.
- 🔄 Restart this workflow from Step 1.

**Only when all 3 steps pass ✅:**
- Proceed with `git push`.
