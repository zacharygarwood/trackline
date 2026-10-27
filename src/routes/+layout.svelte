<script lang="ts">
	import '#lib/design/tokens.css';
	import '#lib/design/base.css';
	import type { LayoutProps } from './$types';

	const { children }: LayoutProps = $props();
</script>

{@render children()}
