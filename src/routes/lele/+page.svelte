<script lang="ts">
	import LeleTable from '$lib/Component/LeleTable.svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	async function UpdateHash(artist_id: string) {
		const data = new FormData();
		data.append('artist_id', artist_id.toString());
		const response = await fetch('?/updateHash', {
			method: 'POST',
			body: data
		});
		const result = await response.text();
		console.log(result);
	}

	let tableData: string[][];
	onMount(async () => {
		tableData = data.data?.map((artist) => {
			return [artist.artist_name];
		}) as string[][];
	});
	const ButtonFunction = async (value: string[]) => {};
</script>

{#if data.data !== null}
	{#each data.data as artist}
		<div>
			{artist.artist_name}
		</div>
	{/each}
{/if}
<LeleTable
	bind:tableData
	buttonPart={{ haveButton: true, buttonText: 'UpdatePassword', ButtonFunction }}
></LeleTable>
