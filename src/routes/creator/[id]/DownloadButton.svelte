<script lang="ts">
	import InfoBox from '$lib/Component/InfoBox.svelte';

	interface Props {
		artist_id: number;
		firstDate: Date | null;
		lastDate: Date | null;
	}

	let { artist_id, firstDate, lastDate }: Props = $props();
</script>

{#if firstDate && lastDate}
	<a href={artist_id.toString() + '/' + firstDate.toISOString() + '/' + lastDate.toISOString()}>
		<InfoBox title={'download'}></InfoBox>
	</a>
{/if}
