module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'google',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['tsconfig.json'],
    sourceType: 'module',
    ecmaVersion: 2021,
  },
  ignorePatterns: [
    'lib/**/*', // Ignore built files.
    '.eslintrc.js',
  ],
  plugins: [
    '@typescript-eslint',
    '@typescript-eslint/eslint-plugin',
    'import',
    'unused-imports',
  ],
  rules: {
    quotes: ['error', 'single'],
    'quote-props': 'off',
    'import/no-unresolved': 0,
    'import/order': 'error',
    indent: ['error', 2],
    'object-curly-spacing': ['error', 'always'],
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'error',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
  },
}
