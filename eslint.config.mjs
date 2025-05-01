import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import pluginBoundaries from "eslint-plugin-boundaries";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  pluginBoundaries.configs.flat.recommended,
  {
    rules: {
      "boundaries/no-unknown": "error",
      "boundaries/no-unknown-files": "error",
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            {
              from: "web",
              allow: ["web", "entities", "di"],
            },
            {
              from: "controllers",
              allow: [
                "entities",
                "service-interfaces",
                "repository-interfaces",
                "use-cases",
              ],
            },
            {
              from: "infrastructure",
              allow: [
                "service-interfaces",
                "repository-interfaces",
                "entities",
              ],
            },
            {
              from: "use-cases",
              allow: [
                "entities",
                "service-interfaces",
                "repository-interfaces",
              ],
            },
            {
              from: "service-interfaces",
              allow: ["entities"],
            },
            {
              from: "repository-interfaces",
              allow: ["entities"],
            },
            {
              from: "entities",
              allow: ["entities"],
            },
            {
              from: "di",
              allow: [
                "di",
                "controllers",
                "service-interfaces",
                "repository-interfaces",
                "use-cases",
                "infrastructure",
              ],
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
