<script lang="ts">
	import Card from '../../design/Card.svelte';
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

<Card title={messages.settings.about}>
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
</Card>

<style>
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
