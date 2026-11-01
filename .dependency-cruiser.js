/** @type {import('dependency-cruiser').IConfiguration} */
export default {
	forbidden: [
		{
			name: 'no-circular',
			severity: 'error',
			from: {},
			to: { circular: true }
		},
		{
			name: 'shared-kernel-is-self-contained',
			comment: 'The shared kernel imports nothing outside itself.',
			severity: 'error',
			from: { path: '^src/lib/shared/' },
			to: { pathNot: '^src/lib/shared/' }
		},
		{
			name: 'domain-is-pure',
			comment: 'A domain layer imports only its own context domain and the shared kernel.',
			severity: 'error',
			from: { path: '^src/lib/([^/]+)/domain/' },
			to: { pathNot: '^src/lib/($1/domain|shared)/' }
		},
		{
			name: 'application-depends-only-inward',
			comment:
				'Use cases import only their own context domain, application, and the shared kernel.',
			severity: 'error',
			from: { path: '^src/lib/([^/]+)/application/' },
			to: { pathNot: '^src/lib/($1/(domain|application)|shared)/' }
		},
		{
			name: 'contexts-meet-only-through-shared-kernel',
			comment: 'Bounded contexts never import each other.',
			severity: 'error',
			from: { path: '^src/lib/(settings|tracking)/' },
			to: {
				path: '^src/lib/(settings|tracking)/',
				pathNot: '^src/lib/$1/'
			}
		},
		{
			name: 'ui-never-imports-infrastructure',
			comment: 'Routes and UI modules reach infrastructure only through the composition root.',
			severity: 'error',
			from: { path: '^src/(routes/|lib/[^/]+/ui/|lib/design/)' },
			to: { path: '(/infrastructure/|^src/lib/platform/(db|photos|backup)/)' }
		},
		{
			name: 'only-composition-root-wires-infrastructure',
			comment:
				'Only the composition root (src/lib/app/container.ts and wire-*.ts) and other infrastructure may import infrastructure.',
			severity: 'error',
			from: {
				pathNot:
					'(^src/lib/app/(container|infrastructure|wire-[a-z]+)\\.ts$|/infrastructure/|^src/lib/platform/|\\.test\\.ts$)'
			},
			to: { path: '(/infrastructure/|^src/lib/platform/(db|photos|backup)/)' }
		},
		{
			name: 'not-to-unresolvable',
			comment:
				'SvelteKit virtual modules ($app/*) and Vite asset imports (?url) resolve at build time.',
			severity: 'error',
			from: {},
			to: { couldNotResolve: true, pathNot: ['^\\$app/', '\\?url$'] }
		}
	],
	options: {
		doNotFollow: { path: 'node_modules' },
		exclude: { path: ['\\.test\\.ts$', '^tests/'] },
		tsPreCompilationDeps: true,
		tsConfig: { fileName: 'tsconfig.json' },
		enhancedResolveOptions: {
			exportsFields: ['exports'],
			conditionNames: ['import', 'require', 'node', 'default', 'types'],
			mainFields: ['module', 'main', 'types', 'typings']
		}
	}
};
