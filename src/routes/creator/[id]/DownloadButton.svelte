<script lang="ts">
	import OkButton from '$lib/UrlBox.svelte';

	export let artist_id: string = '';
	export let firstDate: Date | null;
	export let lastDate: Date | null;
</script>

{#if firstDate && lastDate}
	<OkButton>
		<a href={artist_id + '/' + firstDate.toISOString() + '/' + lastDate.toISOString()}> download</a>
	</OkButton>
{/if}
