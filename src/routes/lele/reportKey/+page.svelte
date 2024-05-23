<script lang="ts">
	import { goto } from '$app/navigation';
	import type { ArtistRow } from '$lib/db';
	import db, { supabase } from '$lib/db';
	import { randomNumber } from '$lib/function/Utils';
	import { LeleTbody, LeleTable, LeleTbodyTr, LeleThead } from '$lib/Component/htmlWrapper';
	import { onMount } from 'svelte';

	let artistData: ArtistRow[] = [];
	onMount(async () => {
		artistData = (await db.GetArtistDataList())?.data ?? [];
	});
	const ButtonFunction = async (id: number) => {
		const random = randomNumber(5);
		const { data, error } = await supabase
			.from('artist')
			.update({ report_key: random })
			.eq('id', id)
			.select()
			.single();

		if (error) {
			console.error(error);
			goto('/');
			return;
		}

		const key = data?.report_key;
		let artistIndex = artistData.findIndex((e) => e.id === id);
		if (artistIndex !== undefined) {
			if (key) artistData[artistIndex].report_key = key;
			else {
				artistData[artistIndex].report_key = 'error';
				console.error('error');
			}
		}
	};
</script>

<LeleTable>
	<LeleThead>
		<tr>
			<th scope="col" class="w-auto p-2"> artist_name </th>
			<th scope="col" class="w-20 p-2"> key </th>
			<th scope="col" class="w-20 p-2"> </th>
		</tr>
	</LeleThead>
	<LeleTbody>
		{#each artistData as artist}
			<LeleTbodyTr>
				<td>{artist.artist_name}</td>
				<td>{artist.report_key}</td>
				<td>
					<button
						class="grow rounded-lg bg-lele-line p-2 text-center text-lele-bg"
						on:click={async () => {
							await ButtonFunction(artist.id);
						}}
					>
						更新
					</button>
				</td>
			</LeleTbodyTr>
		{/each}
	</LeleTbody>
</LeleTable>
