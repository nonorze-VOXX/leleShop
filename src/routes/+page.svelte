<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import type { Artist } from '$lib/db';
	import { goto } from '$app/navigation';
	import LeleThead from '$lib/Component/htmlWrapper/LeleThead.svelte';
	import LeleTbody from '$lib/Component/htmlWrapper/LeleTbody.svelte';
	import LeleTable from '$lib/Component/htmlWrapper/LeleTable.svelte';
	import LeleTbodyTr from '$lib/Component/htmlWrapper/LeleTbodyTr.svelte';
	export let data: PageData;
	let tableData: string[][] = [];
	let artistData: Artist[];

	onMount(() => {
		if (data.data) {
			tableData = data.data?.map((e) => [e.artist_name]) as string[][];
			artistData = data.data as unknown as Artist[];
		}
	});
</script>

<LeleTable>
	<LeleThead>
		<tr>
			<th scope="col" class="w-auto p-2"> 品牌 </th>
			<!-- <th scope="col" class="w-28 p-2 text-lg"> 繳費狀態 </th> -->
			<th scope="col" class="w-20 p-2"> 銷售 </th>
		</tr>
	</LeleThead>
	<LeleTbody>
		{#if data.data}
			{#each data.data as artists}
				<LeleTbodyTr>
					<td class="p-2">
						{artists.artist_name}
					</td>
					<!-- <td class="p-2">
								continue...
							</td> -->
					<td class="p-2">
						<a class="rounded-lg bg-lele-line p-2 text-lele-bg" href={'/creator/' + artists.id}>
							報表
						</a>
					</td>
				</LeleTbodyTr>
			{/each}
		{/if}
	</LeleTbody>
</LeleTable>
