<script lang="ts">
	import Toggle from '$lib/Component/Toggle.svelte';
	import { deserialize } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import type { ArtistRow, QueryTradeBodyWithTradeHead } from '$lib/db';
	import LeleTable from '$lib/Component/htmlWrapper/LeleTable.svelte';
	import LeleThead from '$lib/Component/htmlWrapper/LeleThead.svelte';
	import LeleTbody from '$lib/Component/htmlWrapper/LeleTbody.svelte';
	import LeleTbodyTr from '$lib/Component/htmlWrapper/LeleTbodyTr.svelte';

	export let artistData: ArtistRow[] = [];
	const UpdateVisiable = async (artistData: ArtistRow) => {
		const data = new FormData();
		data.append('id', artistData.id.toString());
		data.append('visible', artistData.visible.toString());
		const response = await fetch('?/UpdateArtistVisible', {
			method: 'POST',
			body: data
		});
		const result = deserialize(await response.text());
		if (result.type === 'success') {
			console.log('refresh');
			await invalidateAll();
		} else if (result.type === 'redirect') {
			goto(result.location);
		}
	};
</script>

<LeleTable>
	<LeleThead>
		<tr>
			<th scope="col" class="w-auto p-2"> 品牌 </th>
			<th scope="col" class="w-20 p-2"> 銷售 </th>
			<th scope="col" class="w-20 p-2"> 可見 </th>
		</tr>
	</LeleThead>
	<LeleTbody>
		{#if artistData}
			{#each artistData as artists}
				<LeleTbodyTr>
					<td class="p-2">
						{artists.artist_name}
					</td>
					<td class="p-2">
						<a
							class="rounded-lg bg-lele-line p-2 text-lele-bg"
							href={'/lele/creator/' + artists.id}
						>
							報表
						</a>
					</td>
					<td>
						<Toggle
							bind:checked={artists.visible}
							on:change={() => {
								console.log(artists.visible);
								UpdateVisiable(artists);
							}}
						></Toggle>
					</td>
				</LeleTbodyTr>
			{/each}
		{/if}
	</LeleTbody>
</LeleTable>
