/** @type {import('stylelint').Config} */
export default {
	extends: ['stylelint-config-standard', 'stylelint-config-html/svelte'],
	plugins: ['stylelint-declaration-strict-value'],
	rules: {
		'custom-property-empty-line-before': null,
		'scale-unlimited/declaration-strict-value': [
			[
				'/color$/',
				'fill',
				'stroke',
				'background',
				'/^margin/',
				'/^padding/',
				'/^inset/',
				'gap',
				'row-gap',
				'column-gap',
				'/radius$/',
				'font-size'
			],
			{
				ignoreValues: [
					'inherit',
					'initial',
					'unset',
					'currentcolor',
					'transparent',
					'none',
					'auto',
					'0'
				],
				disableFix: true
			}
		]
	},
	overrides: [
		{
			files: ['src/lib/design/tokens.css'],
			rules: { 'scale-unlimited/declaration-strict-value': null }
		}
	]
};
