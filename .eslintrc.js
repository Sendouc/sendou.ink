module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", ignoreRestSiblings: true },
    ],
    "no-constant-condition": ["error", { checkLoops: false }],
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-warning-comments": ["warn", { terms: ["xxx"] }],
    "no-var": 0,
    "no-useless-escape": 0,
    "@typescript-eslint/no-unsafe-return": 0,
    "@typescript-eslint/no-unsafe-member-access": 0,
    "@typescript-eslint/no-unsafe-assignment": 0,
    "@typescript-eslint/no-unsafe-call": 0,
    "@typescript-eslint/no-unsafe-argument": 0,
    "@typescript-eslint/no-non-null-assertion": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/unbound-method": 0,
    "@typescript-eslint/consistent-type-imports": "warn",
    "react/prop-types": 0,
    "react/display-name": 0,
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
