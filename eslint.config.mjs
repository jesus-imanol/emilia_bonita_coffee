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
    // Skills instaladas: no es nuestro código, no lo lintamos.
    ".agents/**",
    // Utilidad de generación de assets (one-off con sharp).
    "make-logo.mjs",
  ]),
]);

export default eslintConfig;
