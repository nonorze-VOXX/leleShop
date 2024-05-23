<script lang="ts">
	import Toggle from '$lib/Component/Toggle.svelte';
	import db, { supabase, type ArtistRow } from '$lib/db';
	import LeleTable from '$lib/Component/htmlWrapper/LeleTable.svelte';
	import LeleThead from '$lib/Component/htmlWrapper/LeleThead.svelte';
	import LeleTbody from '$lib/Component/htmlWrapper/LeleTbody.svelte';
	import LeleTbodyTr from '$lib/Component/htmlWrapper/LeleTbodyTr.svelte';
	import { onMount } from 'svelte';

	let artistData: ArtistRow[] = [];
	onMount(async () => {
		artistData = (await db.GetArtistDataList())?.data ?? [];
	});
	const UpdateVisiable = async (artistData: ArtistRow) => {
		const id = artistData.id;
		const visible = artistData.visible;

		const { error } = await supabase.from('artist').update({ visible }).eq('id', id).select();
		if (error) {
			console.error(error);
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
								UpdateVisiable(artists);
							}}
						></Toggle>
					</td>
				</LeleTbodyTr>
			{/each}
		{/if}
	</LeleTbody>
</LeleTable>
