module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/jsx-runtime',
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
    'react/jsx-curly-brace-presence': 'warn',
    'simple-import-sort/imports': 'error', //importとexportのソート
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    '@typescript-eslint/consistent-type-definitions': ['warn', 'type'], //型定義はtypeを使う
    '@typescript-eslint/no-unused-vars': 'error', //未使用の変数禁止
    'react/self-closing-comp': ['error', { component: true, html: true }], //<Component />のように自己閉タグを使う
    'no-control-regex': 'off', //正規表現中のASCII制御文字ok
    'react/jsx-boolean-value': 'error', //attribute={true} → attribute
    'react/jsx-pascal-case': 'error', //コンポーネント名はパスカルケース
    'object-shorthand': ['warn', 'properties', { avoidQuotes: true }],
    'eslint-comments/disable-enable-pair': ['error', { allowWholeFile: true }], //https://mysticatea.github.io/eslint-plugin-eslint-comments/rules/disable-enable-pair.html
    'no-nested-ternary': 'error', //三項演算子のネスト禁止
    'react/function-component-definition': [
      'error', //関数コンポーネントの定義はアロー関数を使う
      { namedComponents: 'arrow-function' },
    ],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: ['variable', 'method', 'accessor', 'function'], //基本的に全てcamelCase
        format: ['camelCase', 'PascalCase'],
      },
      {
        selector: ['property'], //APIリクエスト時にPascalCaseとなっている箇所がある
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
      },
      {
        selector: 'variable', //exportされている定数やコンポーネント
        modifiers: ['exported', 'const'],
        format: ['PascalCase', 'strictCamelCase', 'UPPER_CASE'],
      },
      {
        selector: 'interface', //interfaceはIをつけない
        format: ['PascalCase'],
        custom: { regex: '^I[A-Z]', match: false },
      },
      { selector: ['class', 'typeAlias', 'enum'], format: ['PascalCase'] },
      {
        selector: ['objectLiteralProperty'], //api requestのheadersの'Content-Type'などが対応するためnullで許容する
        format: null,
        modifiers: ['requiresQuotes'],
      },
    ],
  },
  overrides: [],
}