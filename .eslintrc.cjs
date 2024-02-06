/**
 * This is intended to be a basic starting point for linting in your app.
 * It relies on recommended configs out of the box for simplicity, but you can
 * and should modify this configuration to best suit your team's needs.
 */

/** @type {import('eslint').Linter.Config} */
module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  // Base config
  extends: ["eslint:recommended", "prettier"],

  overrides: [
    // React
    {
      extends: [
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
        "plugin:react-hooks/recommended",
        "plugin:jsx-a11y/recommended",
      ],
      files: ["**/*.{js,jsx,ts,tsx}"],
      plugins: ["react", "jsx-a11y"],
      settings: {
        formComponents: ["Form"],
        "import/resolver": {
          typescript: {},
        },
        linkComponents: [
          { linkAttribute: "to", name: "Link" },
          { linkAttribute: "to", name: "NavLink" },
        ],
        react: {
          version: "detect",
        },
      },
    },

    // Typescript
    {
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
      ],
      files: ["**/*.{ts,tsx}"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint", "import"],
      settings: {
        "import/internal-regex": "^~/",
        "import/resolver": {
          node: {
            extensions: [".ts", ".tsx"],
          },
          typescript: {
            alwaysTryTypes: true,
          },
        },
      },
    },

    // Node
    {
      env: {
        node: true,
      },
      files: [".eslintrc.js"],
    },
  ],

  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["sort-keys-fix", "sort-destructure-keys"],
  root: true,

  rules: {
    "sort-destructure-keys/sort-destructure-keys": "warn",
    "sort-keys-fix/sort-keys-fix": "warn",
    "sort-vars": "warn",
  },
}
