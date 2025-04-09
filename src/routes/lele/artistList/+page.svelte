<script lang="ts">
	import Toggle from '$lib/Component/Toggle.svelte';
	import db, { supabase, type ArtistRow } from '$lib/db';
	import LeleTable from '$lib/Component/htmlWrapper/LeleTable.svelte';
	import LeleThead from '$lib/Component/htmlWrapper/LeleThead.svelte';
	import LeleTbody from '$lib/Component/htmlWrapper/LeleTbody.svelte';
	import LeleTbodyTr from '$lib/Component/htmlWrapper/LeleTbodyTr.svelte';
	import { onMount } from 'svelte';

	let artistData: ArtistRow[] = $state([]);
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
	let edit = $state(false);
	let LogForUser = $state('');
</script>

<div class="px-2 font-semibold text-lele-line">
	edit: <Toggle bind:checked={edit}></Toggle>
</div>
{#if edit}
	{#if LogForUser}
		<div class="w-fit rounded-xl border-2 border-lele-line px-2 font-semibold text-lele-line">
			{LogForUser}
		</div>
	{/if}
	<form
		class="flex gap-2 py-2"
		onsubmit={async (e) => {
			e.preventDefault();
			const before = e.currentTarget.beforeName.value;
			const after = e.currentTarget.afterName.value;
			if (before === after) {
				LogForUser = 'before and after are the same';
				return;
			}
			if (!before || !after) {
				LogForUser = '不要空白';
				return;
			}
			const { data, error } = await supabase
				.from('artist')
				.update({ artist_name: after })
				.eq('artist_name', before)
				.select();
			if (error) {
				LogForUser = error.message;
				return;
			} else {
				LogForUser = 'success change ' + before + ' to ' + after;
			}
			const { data: exist, error: error1 } = await supabase
				.from('artist_alias')
				.select()
				.eq('artist_alias', after);
			if (error1) {
				console.log(error1);
				LogForUser = error1.message;
				return;
			}
			if (exist.length === 0) {
				const { error: error2 } = await supabase
					.from('artist_alias')
					.insert({ artist_alias: after, artist_id: data[0].id });
				if (error2) {
					console.log(error2);
					LogForUser = error2.message;
					return;
				}
			}

			artistData = artistData.map((artist) => {
				if (artist.artist_name === before) {
					artist.artist_name = after;
				}
				return artist;
			});
		}}
	>
		<select
			name="beforeName"
			id="beforeName"
			class=" rounded-lg border-lele-line bg-lele-line p-2 font-semibold text-lele-bg"
		>
			{#each artistData as artist}
				<option value={artist.artist_name}>{artist.artist_name}</option>
			{/each}
		</select>
		<div class="h-full content-center text-center font-semibold text-lele-line">{'=>'}</div>
		<input
			type="text"
			name="afterName"
			id="afterName"
			class="rounded-xl border-2 border-lele-line px-2 font-semibold text-lele-line"
		/>
		<input
			type="submit"
			value="Submit"
			class=" rounded-lg border-lele-line bg-lele-line p-2 font-semibold text-lele-bg"
		/>
	</form>
{/if}
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
							onChange={() => {
								UpdateVisiable(artists);
							}}
						></Toggle>
					</td>
				</LeleTbodyTr>
			{/each}
		{/if}
	</LeleTbody>
</LeleTable>
