import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    { ignores: ['dist', 'supabase/functions', 'android', 'ios'] },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            // Allow 'any' in specific cases (error handling, API responses)
            '@typescript-eslint/no-explicit-any': 'warn',
            // Allow empty catch blocks (intentional no-op handling)
            'no-empty': 'off',
            // Allow setState in effects for initialization from localStorage
            'react-hooks/set-state-in-effect': 'off',
            // Prefer const is handled during development
            'prefer-const': 'warn',
        },
    },
    // Allow context files to export hooks alongside providers
    {
        files: ['**/context/*.tsx'],
        rules: {
            'react-refresh/only-export-components': 'off',
        },
    },
);

