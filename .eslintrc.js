module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ["react", "prettier", "simple-import-sort", "import"],
  settings: {
    react: {
      version: "detect"
    }
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended"
  ],
  rules: {
    "simple-import-sort/sort": ["error"],
    "sort-imports": ["off"],
    "import/first": ["error"],
    "import/newline-after-import": ["error"],
    "import/no-duplicates": ["error"],
    "react/prop-types": ["off"],
    "react/display-name": ["off"]
  }
};