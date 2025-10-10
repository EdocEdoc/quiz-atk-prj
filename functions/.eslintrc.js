module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  extends: ["eslint:recommended"],
  rules: {
    // 💡 Style relaxations
    quotes: ["warn", "double", { allowTemplateLiterals: true }],
    semi: ["warn", "always"],
    "object-curly-spacing": "off",
    indent: "off",
    "no-unused-vars": "warn",
    "no-console": "off",

    // Optional: turn errors into warnings
    "prefer-arrow-callback": "warn",
  },
};
