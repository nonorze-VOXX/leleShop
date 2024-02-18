<script lang="ts">
	import LeleTable from '$lib/Component/LeleTable.svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { deserialize } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { invalidateAll } from '$app/navigation';
	import type { Artist } from '$lib/db';

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
		if (result.type === 'success') {
			invalidateAll();
		}
	};
</script>

<div class="flex flex-col items-center">
	<div class=" rounded-lg bg-slate-400">
		<LeleTable
			bind:tableHead
			bind:tableData
			buttonPart={{ haveButton: true, buttonText: 'UpdatePassword', ButtonFunction }}
		></LeleTable>
	</div>
</div>
