<script lang="ts">
	import { messages } from '../../i18n/messages.en.ts';
	import ExternalLink from '../../design/ExternalLink.svelte';
	import { ExternalUrl } from '../../ui/external-url.constants.ts';

	/** Props for Settings' About section. */
	interface Props {
		/** The app version, for example "1.0.0". */
		version: string;
	}

	const { version }: Props = $props();
</script>

<section>
	<h2>{messages.settings.about}</h2>
	<p>{messages.settings.version(version)}</p>
	<p>
		{messages.settings.licensed}
		<ExternalLink href={ExternalUrl.license}>{messages.settings.licenseName}</ExternalLink>
	</p>
	<ul>
		<li>
			<ExternalLink href={ExternalUrl.source}>{messages.settings.sourceCode}</ExternalLink>
		</li>
		<li>
			<ExternalLink href={ExternalUrl.donate}>{messages.settings.donate}</ExternalLink>
		</li>
	</ul>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	h2 {
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-regular);
	}

	ul {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: flex;
		align-items: center;
		min-height: var(--tap-target);
	}
</style>
