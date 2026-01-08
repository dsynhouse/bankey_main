---
description: Verify codebase integrity (Lint, Types, Build)
---

# Deep Verification Protocol

Run this workflow before every commit to ensure zero regressions.

1. **Lint Check**: Ensures code style and prevents unused variables.
   ```bash
   npm run lint
   ```

2. **Type Safety**: strict TypeScript check.
   ```bash
   npx tsc --noEmit
   ```

3. **Build Verification**: Ensures production build succeeds.
   ```bash
   npm run build
   ```

// turbo-all
