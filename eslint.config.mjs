import { defineConfig, globalIgnores } from "eslint/config";
import { FlatCompat } from "@eslint/eslintrc";
import { fileURLToPath } from "node:url";

const baseDirectory = fileURLToPath(new URL(".", import.meta.url));
const compat = new FlatCompat({ baseDirectory });

export default defineConfig([
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "react-hooks/set-state-in-effect": "off"
    }
  },
  globalIgnores([
    ".next/**",
    ".next-*/**",
    "node_modules/**",
    "next-env.d.ts",
    "out/**",
    "coverage/**"
  ])
]);
