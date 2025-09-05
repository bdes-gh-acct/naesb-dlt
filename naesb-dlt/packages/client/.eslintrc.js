const root = require('../../.eslintrc.react');

module.exports = {
  ...root,
  rules: {
    "@typescript-eslint/no-explicit-any": "warn",
    "prettier/prettier": "warn",
    "react/function-component-definition": [
      "error",
      {
        "namedComponents": "arrow-function", // or "function-expression"
        "unnamedComponents": "arrow-function"
      }
      
    ],
    "react/react-in-jsx-scope": "warn",
    "react/jsx-no-useless-fragment": "warn",
    "react/jsx-props-no-spreading": "warn",
    "import/prefer-default-export": "warn",
    "no-nested-ternary": "warn",
  },
};
