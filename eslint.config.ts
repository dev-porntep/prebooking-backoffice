import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  ignores: ['scripts/**'],
  rules: {
    // ── TypeScript ──────────────────────────────────────
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    '@typescript-eslint/consistent-type-imports': ['error', {
      prefer: 'type-imports',
      fixStyle: 'inline-type-imports',
    }],
    '@typescript-eslint/no-import-type-side-effects': 'error',

    // ── Vue ─────────────────────────────────────────────
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off',
    'vue/define-macros-order': ['error', {
      order: ['defineProps', 'defineEmits', 'defineOptions', 'defineSlots'],
    }],
    'vue/block-order': ['error', {
      order: ['script', 'template', 'style'],
    }],
    'vue/component-api-style': ['error', ['script-setup']],

    // ── General ─────────────────────────────────────────
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-debugger': 'error',
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'multi-line'],
  },
})
