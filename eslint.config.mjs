import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'
import onlyWarn from 'eslint-plugin-only-warn'
import perfectionist from 'eslint-plugin-perfectionist'
import { defineConfig } from 'eslint/config'
import reactCompiler from 'eslint-plugin-react-compiler'

const eslintConfig = defineConfig([
  js.configs.recommended,
  ...nextVitals,
  ...nextTs,
  stylistic.configs.recommended,
  perfectionist.configs['recommended-natural'],
  reactCompiler.configs.recommended,
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': ['warn', {
        disallowTypeAnnotations: false,
        fixStyle: 'inline-type-imports',
        prefer: 'type-imports',
      }],
    },
  },
  {
    plugins: {
      'better-tailwindcss': eslintPluginBetterTailwindcss,
    },
    rules: {
      ...eslintPluginBetterTailwindcss.configs.recommended.rules,
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: './app/globals.css',
      },
    },
  },
])

export default eslintConfig
