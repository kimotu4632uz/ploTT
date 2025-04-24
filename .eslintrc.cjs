module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:eslint-comments/recommended',
  ],
  env: { browser: true, node: true, es6: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'simple-import-sort', 'import'],
  ignorePatterns: ['node_modules/', '.eslintrc.cjs'],
  rules: {
    'simple-import-sort/imports': 'error', //importとexportのソート
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    '@typescript-eslint/consistent-type-definitions': ['warn', 'type'], //型定義はtypeを使う
    '@typescript-eslint/no-unused-vars': 'error', //未使用の変数禁止
    'no-control-regex': 'off', //正規表現中のASCII制御文字ok
    'object-shorthand': ['warn', 'properties', { avoidQuotes: true }],
    'eslint-comments/require-description': 'error', //eslint-disable-next-lineのコメントは必ず説明を書く。https://mysticatea.github.io/eslint-plugin-eslint-comments/rules/require-description.html
    'eslint-comments/disable-enable-pair': ['error', { allowWholeFile: true }], //https://mysticatea.github.io/eslint-plugin-eslint-comments/rules/disable-enable-pair.html
    'no-nested-ternary': 'error', //三項演算子のネスト禁止
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: ['method', 'accessor'], //基本的に全てcamelCase
        format: ['strictCamelCase'],
      },
      {
        selector: 'variable', //exportされている定数やコンポーネント
        modifiers: ['const'],
        format: ['PascalCase', 'camelCase'],
      },
      {
        selector: ['variable'], //基本的に全てcamelCase
        format: ['camelCase'],
      },
      {
        selector: ['property'], //APIリクエスト時にPascalCaseとなっている箇所がある
        format: ['camelCase'],
      },
      {
        selector: 'interface', //interfaceはIをつけない
        format: ['PascalCase'],
        custom: { regex: '^I[A-Z]', match: false },
      },
      { selector: ['class', 'typeAlias', 'enum'], format: ['PascalCase'] },
    ],
  },
  overrides: [],
}