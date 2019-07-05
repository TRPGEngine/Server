module.exports = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'always',
  parser: 'babylon',
  jsxBracketSameLine: false,
  overrides: [
    {
      files: ['*.json', '.babelrc', '.prettierrc.json'],
      options: {
        parser: 'json',
      },
    },
    {
      files: '*.{tsx,ts}',
      options: {
        parser: 'typescript',
      },
    },
  ],
};
