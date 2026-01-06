import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Ignorar código generado
    "src/generated/**",
  ]),
  // Reglas personalizadas
  {
    rules: {
      // Prevenir console.log en producción
      "no-console": ["warn", { allow: ["warn", "error"] }],
      // Preferir const sobre let cuando sea posible
      "prefer-const": "error",
      // No permitir variables no usadas
      "@typescript-eslint/no-unused-vars": ["error", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_" 
      }],
      // Requerir tipos explícitos en funciones exportadas
      "@typescript-eslint/explicit-module-boundary-types": "off",
      // No usar any implícito
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
]);

export default eslintConfig;
