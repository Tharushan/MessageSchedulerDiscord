module.exports = {
  extends: ['airbnb', 'prettier'],
  env: {
    node: true,
    es6: true,
    mocha: true
  },
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'none',
        bracketSpacing: true,
        jsxBracketSameLine: false,
        parser: 'babylon'
      }
    ],
    'func-names': ['off'],
    'no-underscore-dangle': ['off'],
    'class-methods-use-this': ['off']
  }
};