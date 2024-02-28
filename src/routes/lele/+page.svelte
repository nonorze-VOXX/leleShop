<script lang="ts">
	import LeleTable from '$lib/Component/LeleTable.svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { deserialize } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { invalidateAll } from '$app/navigation';
	import type { Artist } from '$lib/db';

	export let data: PageData;

	let tableData: string[][];
	let tableHead: string[] = ['artist name'];
	let artistData: Artist[] = [];
	onMount(async () => {
		artistData = data.data as unknown as Artist[];
		tableData = data.data?.map((artist) => {
			return [artist.artist_name, artist.report_key];
		}) as string[][];
	});
	const ButtonFunction = async (value: string[]) => {
		const data = new FormData();
		const artist = artistData.find((e) => e.artist_name == value[0]);
		if (artist === undefined) {
			return;
		}
		if (artist.id === undefined) {
			return;
		}
		data.append('id', artist.id as string);
		const response = await fetch('?/UpdateReportKey', {
			method: 'POST',
			body: data
		});
		const result: ActionResult = deserialize(await response.text());
		console.log(result.type);
		if (result.type === 'success') {
			console.log('refresh');
			let artistIndex = tableData.findIndex((e) => e[0] === artist.artist_name);
			console.log(artistIndex);

			if (artistIndex !== undefined) {
				tableData[artistIndex][1] = result.data?.key;
			}
			await invalidateAll();
		}
	};
</script>

<div class="flex flex-col items-center">
	<LeleTable
		bind:tableHead
		bind:tableData
		buttonPart={{ haveButton: true, buttonText: 'update key', ButtonFunction }}
	></LeleTable>
</div>

<div class="flex h-fit w-screen flex-wrap gap-4 p-4">
	<div class="h-fit w-fit rounded-lg border-4 border-blue-700 p-3 text-5xl">
		<a href="/lele/importCsv">import csv</a>
	</div>
</div>
