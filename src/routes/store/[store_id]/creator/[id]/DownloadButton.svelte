<script lang="ts">
	import InfoBox from '$lib/Component/InfoBox.svelte';

	export let artist_id: string = '';
	export let firstDate: Date | null;
	export let lastDate: Date | null;
</script>

{#if firstDate && lastDate}
	<a href={artist_id + '/' + firstDate.toISOString() + '/' + lastDate.toISOString()}>
		<InfoBox title={'download'}></InfoBox>
	</a>
{/if}
