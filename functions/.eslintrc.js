module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
  ],
  plugins: ["@typescript-eslint", "import"],
  ignorePatterns: ["/lib/**/*", "/generated/**/*"],
  rules: {
    // ✅ Style relaxed
    quotes: ["warn", "double", { allowTemplateLiterals: true }],
    semi: ["warn", "always"],
    indent: "off",
    "object-curly-spacing": "off",
    "comma-dangle": "off",
    "max-len": "off",

    // ✅ TypeScript-specific relaxations
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/explicit-module-boundary-types": "off",

    // ✅ General code quality
    "no-console": "off",
    "import/no-unresolved": "off",
  },
};
