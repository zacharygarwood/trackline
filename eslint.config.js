import path from 'node:path';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import i18next from 'eslint-plugin-i18next';
import { importX } from 'eslint-plugin-import-x';
import jsdoc from 'eslint-plugin-jsdoc';
import sonarjs from 'eslint-plugin-sonarjs';
import svelte from 'eslint-plugin-svelte';
import unicorn from 'eslint-plugin-unicorn';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

const typeSafetySyntax = [
	{
		selector: 'TSEnumDeclaration',
		message: 'Use an `as const` object with a derived union type instead of an enum.'
	},
	{
		selector: 'MemberExpression[computed=true][property.type="Literal"][property.raw=/^[0-9]/]',
		message: 'Use first, last, or elementAt from the shared kernel instead of numeric indexing.'
	}
];

const hiddenEffectSyntax = [
	{
		selector: 'CallExpression[callee.object.name="Date"][callee.property.name="now"]',
		message: 'Inject a Clock instead of reading the current time.'
	},
	{
		selector: 'NewExpression[callee.name="Date"][arguments.length=0]',
		message: 'Inject a Clock instead of reading the current time.'
	},
	{
		selector: 'MemberExpression[object.name="Math"][property.name="random"]',
		message: 'Inject an IdGenerator or a random source instead.'
	},
	{
		selector: 'MemberExpression[property.name="randomUUID"]',
		message: 'Inject an IdGenerator instead.'
	}
];

const literalTextSyntax = [
	{
		selector: 'SvelteText[value=/\\S/]:not(SvelteStyleElement SvelteText)',
		message: 'Put user-facing text in the messages module.'
	}
];

const networkGlobals = [
	{ name: 'fetch', message: 'Network access is only allowed in src/lib/platform/pwa/.' },
	{ name: 'XMLHttpRequest', message: 'Network access is only allowed in src/lib/platform/pwa/.' },
	{ name: 'WebSocket', message: 'Network access is only allowed in src/lib/platform/pwa/.' },
	{ name: 'EventSource', message: 'Network access is only allowed in src/lib/platform/pwa/.' }
];

const networkProperties = [
	{ object: 'navigator', property: 'sendBeacon', message: 'Network access is forbidden.' },
	{ object: 'window', property: 'fetch', message: 'Network access is forbidden.' },
	{ object: 'globalThis', property: 'fetch', message: 'Network access is forbidden.' }
];

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	{ linterOptions: { noInlineConfig: true, reportUnusedDisableDirectives: 'error' } },
	js.configs.recommended,
	ts.configs.strictTypeChecked,
	ts.configs.stylisticTypeChecked,
	svelte.configs.recommended,
	sonarjs.configs.recommended,
	importX.flatConfigs.recommended,
	importX.flatConfigs.typescript,
	jsdoc.configs['flat/recommended-typescript-error'],
	prettier,
	svelte.configs.prettier,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node },
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
				extraFileExtensions: ['.svelte']
			}
		},
		settings: {
			jsdoc: { mode: 'typescript', tagNamePreference: { template: 'typeParam' } },
			'import-x/resolver': { typescript: true }
		},
		plugins: { unicorn },
		rules: {
			'no-undef': 'off',
			'no-console': 'error',
			eqeqeq: ['error', 'always'],
			'no-param-reassign': ['error', { props: true }],
			'prefer-const': ['error', { destructuring: 'all' }],
			'no-restricted-syntax': ['error', ...typeSafetySyntax, ...hiddenEffectSyntax],

			'@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
			'@typescript-eslint/strict-boolean-expressions': [
				'error',
				{ allowString: false, allowNumber: false, allowNullableObject: false }
			],
			'@typescript-eslint/switch-exhaustiveness-check': [
				'error',
				{ considerDefaultExhaustiveForUnions: false, requireDefaultForNonUnion: true }
			],
			'@typescript-eslint/prefer-readonly': 'error',
			'@typescript-eslint/no-extraneous-class': ['error', { allowEmpty: true }],
			'@typescript-eslint/no-magic-numbers': [
				'error',
				{
					ignore: [0, 1],
					ignoreEnums: true,
					ignoreNumericLiteralTypes: true,
					ignoreReadonlyClassProperties: true,
					ignoreTypeIndexes: true
				}
			],
			'@typescript-eslint/max-params': ['error', { max: 3 }],

			'max-lines-per-function': ['error', { max: 30, skipBlankLines: true, skipComments: true }],
			'max-lines': ['error', { max: 250, skipBlankLines: true, skipComments: true }],
			complexity: ['error', 8],
			'max-depth': ['error', 3],
			'sonarjs/cognitive-complexity': ['error', 10],
			'sonarjs/function-return-type': 'off',

			'import-x/no-cycle': 'error',
			'import-x/no-default-export': 'error',
			'import-x/no-unresolved': 'off',
			'import-x/no-named-as-default': 'off',
			'import-x/no-named-as-default-member': 'off',

			'jsdoc/require-jsdoc': [
				'error',
				{
					publicOnly: true,
					enableFixer: false,
					checkConstructors: false,
					require: {
						FunctionDeclaration: true,
						ClassDeclaration: true,
						MethodDefinition: true,
						ArrowFunctionExpression: true,
						FunctionExpression: true
					},
					contexts: [
						'TSInterfaceDeclaration',
						'TSTypeAliasDeclaration',
						'ExportNamedDeclaration > VariableDeclaration'
					]
				}
			],
			'jsdoc/require-param': 'off',
			'jsdoc/require-throws-type': 'off',
			'jsdoc/tag-lines': ['error', 'any', { startLines: 1 }],
			'jsdoc/require-returns': 'off',
			'jsdoc/check-tag-names': [
				'error',
				{ definedTags: ['remarks', 'typeParam', 'defaultValue', 'privateRemarks'] }
			],

			'unicorn/prefer-node-protocol': 'error',
			'unicorn/no-for-loop': 'error',
			'unicorn/no-lonely-if': 'error',
			'unicorn/no-useless-spread': 'error',
			'unicorn/no-useless-undefined': 'error',
			'unicorn/prefer-array-find': 'error',
			'unicorn/prefer-includes': 'error',
			'unicorn/prefer-string-slice': 'error',
			'unicorn/throw-new-error': 'error'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts'],
		languageOptions: { parserOptions: { parser: ts.parser } },
		rules: {
			'svelte/block-lang': ['error', { script: 'ts' }],
			'svelte/no-at-html-tags': 'error',
			'svelte/require-each-key': 'error',
			'@typescript-eslint/no-useless-default-assignment': 'off'
		}
	},
	{
		files: ['src/**'],
		plugins: { i18next },
		rules: {
			'i18next/no-literal-string': [
				'error',
				{
					mode: 'all',
					callees: {
						exclude: [
							'i18n(ext)?',
							't',
							'require',
							'addEventListener',
							'removeEventListener',
							'postMessage',
							'getElementById',
							'dispatch',
							'commit',
							'includes',
							'indexOf',
							'endsWith',
							'startsWith',
							'Error',
							'URL',
							'Worker',
							'import\\.meta\\.glob'
						]
					}
				}
			],
			'no-restricted-syntax': [
				'error',
				...typeSafetySyntax,
				...hiddenEffectSyntax,
				...literalTextSyntax
			],
			'no-restricted-globals': ['error', ...networkGlobals],
			'no-restricted-properties': ['error', ...networkProperties]
		}
	},
	{
		files: ['src/lib/i18n/messages.*.ts', 'src/**/*.constants.ts', 'src/**/*.sql.ts'],
		rules: { 'i18next/no-literal-string': 'off' }
	},
	{
		files: ['src/lib/i18n/messages.*.ts'],
		rules: { 'max-lines': 'off' }
	},
	{
		files: ['src/**/*.row.ts'],
		rules: { '@typescript-eslint/consistent-type-definitions': 'off' }
	},
	{
		files: ['src/lib/design/**'],
		rules: { 'svelte/no-navigation-without-resolve': 'off' }
	},
	{
		files: ['src/lib/platform/db/worker.ts'],
		rules: { 'sonarjs/post-message': 'off' }
	},
	{
		files: ['src/lib/platform/pwa/**', 'src/service-worker/**'],
		rules: { 'no-restricted-globals': 'off', 'no-restricted-properties': 'off' }
	},
	{
		files: ['src/lib/platform/system/**'],
		rules: { 'no-restricted-syntax': ['error', ...typeSafetySyntax, ...literalTextSyntax] }
	},
	{
		files: ['**/*.test.ts', 'tests/**'],
		rules: {
			'@typescript-eslint/no-magic-numbers': 'off',
			'sonarjs/no-floating-point-equality': 'off',
			'sonarjs/no-empty-test-file': 'off',
			'@typescript-eslint/max-params': 'off',
			'i18next/no-literal-string': 'off',
			'max-lines-per-function': 'off',
			'jsdoc/require-jsdoc': 'off'
		}
	},
	{
		files: ['*.config.{js,ts}', '.dependency-cruiser.js'],
		rules: {
			'import-x/no-default-export': 'off',
			'@typescript-eslint/no-magic-numbers': 'off',
			'max-lines': 'off'
		}
	},
	{
		files: ['**/*.{js,cjs}'],
		extends: [ts.configs.disableTypeChecked]
	}
);
