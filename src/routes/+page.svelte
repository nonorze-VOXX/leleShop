<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import type { Artist, QueryArtistWithPaymentStatus } from '$lib/db';
	import { goto } from '$app/navigation';
	import LeleThead from '$lib/Component/htmlWrapper/LeleThead.svelte';
	import LeleTbody from '$lib/Component/htmlWrapper/LeleTbody.svelte';
	import LeleTable from '$lib/Component/htmlWrapper/LeleTable.svelte';
	import LeleTbodyTr from '$lib/Component/htmlWrapper/LeleTbodyTr.svelte';
	export let data: PageData;
	let artistData: {
		id: number;
		artist_name: string | null;
		visible: boolean;
		artist_payment_status: {
			artist_id: number | null;
			id: number;
			process_state: 'todo' | 'doing' | 'done' | null;
			season: string | null;
		}[];
	}[];

	onMount(() => {
		artistData = data.data ?? [];
	});
</script>

<LeleTable>
	<LeleThead>
		<tr>
			<th scope="col" class="w-auto p-2"> 品牌 </th>
			<th scope="col" class="w-12 p-2 text-center"> 繳費 </th>
			<th scope="col" class="w-16 p-2 text-center"> 銷售 </th>
		</tr>
	</LeleThead>
	<LeleTbody>
		{#if artistData}
			{#each artistData as artists}
				<LeleTbodyTr>
					<td class="p-2">
						{artists.artist_name}
					</td>
					<td class="text-center">
						<div class="text-lg">
							{#if artists.artist_payment_status.at(0)?.process_state === 'done'}
								✅
							{:else if artists.artist_payment_status.at(0)?.process_state === 'doing'}
								🔺
							{:else}
								❌
							{/if}
						</div>
					</td>
					<td class="flex">
						<a
							class="grow rounded-lg bg-lele-line p-2 text-center text-lele-bg"
							href={'/creator/' + artists.id}
						>
							報表
						</a>
					</td>
				</LeleTbodyTr>
			{/each}
		{/if}
	</LeleTbody>
</LeleTable>
