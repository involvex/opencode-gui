// @ts-check
import tseslint from 'typescript-eslint'
import eslint from '@eslint/js'

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{
		rules: {
			// Relax unused vars to warning to avoid breaking existing codebase
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/no-require-imports': 'off',
			'@typescript-eslint/no-namespace': 'off',
			'@typescript-eslint/no-unused-expressions': 'off',
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/ban-ts-comment': 'off',
			'no-console': 'off',
			'no-empty-pattern': 'off',
			'no-useless-escape': 'off',
			'no-case-declarations': 'off',
			'@typescript-eslint/no-unsafe-function-type': 'off',
			'no-unassigned-vars': 'off',
		},
	},
	{
		ignores: [
			'dist/**',
			'out/**',
			'node_modules/**',
			'tmp/**',
			'coverage/**',
			'*.js',
			'.vscode-test/**',
		],
	},
)
