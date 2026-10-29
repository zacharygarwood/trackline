<script lang="ts">
	import Card from '../../design/Card.svelte';
	import Row from '../../design/Row.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import { ExternalUrl } from '../../ui/external-url.constants.ts';

	/** Props for Settings' About section. */
	interface Props {
		/** The app version, for example "1.0.0". */
		version: string;
	}

	const { version }: Props = $props();
</script>

<Card title={messages.settings.about}>
	<Row label={messages.settings.versionLabel} value={version} />
	<Row
		label={messages.settings.license}
		value={messages.settings.licenseShort}
		href={ExternalUrl.license}
	/>
	<Row label={messages.settings.sourceCode} action href={ExternalUrl.source} />
	<Row label={messages.settings.donate} action href={ExternalUrl.donate} />
</Card>
