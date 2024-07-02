import globals from "globals";
import path from 'path';
import { fileURLToPath } from 'url';
import js from "@eslint/js"
import prettier from "eslint-config-prettier"
import { FlatCompat } from "@eslint/eslintrc";
//import guardianConfig from "@guardian/eslint-config-typescript"; //Use this once an es-module compatible version is available

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
});

export default [
  ...compat.extends("@guardian/eslint-config-typescript", ''), //replace with guardianConfig once an es-module compatible version is available
 //guardianConfig,
  {
    files: ["**/*.ts"],

	languageOptions: {
		ecmaVersion: 2022,
		sourceType: "module",
		globals: { ...globals.jest, ...globals.node },
		parserOptions: {
			ecmaVersion: 2022,
			tsconfigRootDir: __dirname,
			sourceType: 'module',
			project: ['./tsconfig.eslint.json'],
		}
	},

    plugins: { compat },
	rules: {
		'@typescript-eslint/no-inferrable-types': 0,
		'import/no-namespace': 2,
		'import/newline-after-import': 0,
		'import/no-named-as-default': 0,
		'import/no-named-as-default-member': 0,
	},
	ignores: ['jest.config.js', 'node_modules', 'dist']
  },
  prettier,
]
