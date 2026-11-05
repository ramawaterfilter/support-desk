import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import security from "eslint-plugin-security";
import noSecrets from "eslint-plugin-no-secrets";

export default tseslint.config(
  {
    ignores: ["**/dist/**", "**/node_modules/**", "coverage/**", "docs/reference/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  security.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mjs"],
    plugins: { "no-secrets": noSecrets },
    rules: {
      "no-secrets/no-secrets": "error",
      // Query-builder params are placeholders for $1/$2 and intentionally unused.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Dynamic key access is pervasive in the scaffold's query builders and is
      // noisy there; the rule stays off until business logic indexes dynamically.
      // shortcut: re-enable if user-controlled keys reach object indexing
      "security/detect-object-injection": "off",
    },
  },
  {
    files: [
      "apps/**/*.{ts,tsx,js}",
      "packages/**/*.{ts,js}",
      "scripts/**/*.mjs",
      "*.config.{js,mjs}",
    ],
    languageOptions: { globals: { ...globals.node, ...globals.commonjs } },
  },
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    languageOptions: { globals: { ...globals.browser } },
  },
  {
    // CommonJS tool config files (postcss/tailwind) legitimately use require().
    files: ["**/*.js"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
);
