<script lang="ts">
	import LeleTable from '$lib/Component/LeleTable.svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import type { Artist } from '$lib/db';
	import { goto } from '$app/navigation';
	export let data: PageData;
	let tableData: string[][] = [];
	let tableHead: string[] = ['artist_name'];
	let artistData: Artist[];

	onMount(() => {
		if (data.data) {
			tableData = data.data?.map((e) => [e.artist_name]) as string[][];
			artistData = data.data as unknown as Artist[];
		}
	});
	const ButtonFunction = async (value: string[]) => {
		console.log('value' + value);
		console.log(artistData);
		const artistIndex = artistData.findIndex((e) => {
			return value.includes(e.artist_name as string);
		});

		console.log(artistIndex);
		goto('./creator/' + artistData[artistIndex]?.id);
	};
</script>

<div class="w-screen h-fit gap-4 p-4 flex flex-wrap">
	<div class="rounded-lg border-4 w-fit h-fit border-blue-700 p-3 text-5xl">
		<a href="./importCsv">import csv</a>
	</div>
</div>
<div class="flex flex-col items-center">
	<div class="w-1/2 p-3">
		<LeleTable
			bind:tableData
			bind:tableHead
			buttonPart={{ haveButton: true, buttonText: 'view', ButtonFunction }}
		/>
	</div>
</div>
