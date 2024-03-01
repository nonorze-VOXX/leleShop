<script lang="ts">
	import LeleTable from '$lib/Component/LeleTable.svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import type { Artist } from '$lib/db';
	import { goto } from '$app/navigation';
	import LeleBox from '$lib/Component/LeleBox.svelte';
	export let data: PageData;
	let tableData: string[][] = [];
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

<LeleBox>
	<!-- <LeleTable
		bind:tableData
		bind:tableHead
		buttonPart={{ haveButton: true, buttonText: 'view', ButtonFunction }}
	/> -->
	<div class="relative overflow-auto p-2">
		<table class="w-full table-fixed text-left">
			<thead class=" border-b-4 border-lele-line border-opacity-70">
				<tr>
					<th scope="col" class="w-auto p-2 text-lg"> 品牌 </th>
					<!-- <th scope="col" class="w-28 p-2 text-lg"> 繳費狀態 </th> -->
					<th scope="col" class="w-20 p-2 text-lg"> 銷售 </th>
				</tr>
			</thead>
			<tbody>
				{#if data.data}
					{#each data.data as artists}
						<tr class="text-base font-semibold hover:bg-slate-600 hover:text-white">
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
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</LeleBox>
