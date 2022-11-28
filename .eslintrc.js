module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  ignorePatterns: ["discord-bot/**/*"],
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "@remix-run/eslint-config",
    "@remix-run/eslint-config/node",
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "no-constant-condition": ["error", { checkLoops: false }],
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-warning-comments": ["warn", { terms: ["xxx"] }],
    "no-var": 0,
    "@typescript-eslint/no-unsafe-return": 0,
    "@typescript-eslint/no-unsafe-member-access": 0,
    "@typescript-eslint/no-unsafe-assignment": 0,
    "@typescript-eslint/no-unsafe-call": 0,
    "@typescript-eslint/no-unsafe-argument": 0,
    "@typescript-eslint/no-non-null-assertion": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/unbound-method": 0,
    "react/prop-types": 0,
    "@typescript-eslint/no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "react-i18next",
            importNames: ["useTranslation"],
            message:
              "Please import useTranslation from '~/hooks/useTranslation' instead.",
          },
        ],
      },
    ],
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
