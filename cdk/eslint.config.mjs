import js from "@eslint/js"
import prettier from "eslint-config-prettier"
import { FlatCompat } from "@eslint/eslintrc";
//import guardianConfig from "@guardian/eslint-config-typescript"; //Use this once an es-module compatible version is available

const compat = new FlatCompat({
    baseDirectory: import.meta.dirname,
	recommendedConfig: js.configs.recommended,
});

export default [
  ...compat.extends("@guardian/eslint-config-typescript", ''), //replace with guardianConfig once an es-module compatible version is available
 //guardianConfig,
  {
    files: ["**/*.ts"],

	languageOptions: {
		ecmaVersion: 2022,
		sourceType: "commonjs",
		parserOptions: {
			ecmaVersion: 2022,
			tsconfigRootDir: import.meta.dirname,
			sourceType: 'commonjs',
			project: ['./tsconfig.eslint.json'],
		}
	},

    plugins: { compat },
	rules: {
		'@typescript-eslint/no-inferrable-types': 0,
		'import/no-namespace': 2,
		'import/newline-after-import': 0
	},
	ignores: ['node_modules', 'cdk.out', 'jest.config.js'	]
  },
  prettier,
]
