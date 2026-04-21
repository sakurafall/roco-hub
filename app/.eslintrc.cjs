/* eslint-env node */
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  extends: [
    'plugin:vue/vue3-recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  globals: {
    uni: 'readonly',
    wx: 'readonly',
    plus: 'readonly',
    getCurrentPages: 'readonly',
    getApp: 'readonly',
    UniApp: 'readonly',
    Page: 'readonly',
    App: 'readonly',
    UniHelper: 'readonly',
    NodeJS: 'readonly',
    __APP_ENV__: 'readonly',
  },
  ignorePatterns: ['dist', 'node_modules', 'unpackage', 'mock'],
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-deprecated-slot-attribute': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off',
  },
}
