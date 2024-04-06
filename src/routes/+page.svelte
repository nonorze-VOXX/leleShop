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
			<th scope="col" class="w-28 p-2 text-lg"> 繳費狀態 </th>
			<th scope="col" class="w-20 p-2"> 銷售 </th>
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
						{#if artists.artist_payment_status.at(0)?.process_state === 'done'}
							<div>✅</div>
						{:else if artists.artist_payment_status.at(0)?.process_state === 'doing'}
							<div>🔺</div>
						{:else}
							<div>❌</div>
						{/if}
					</td>
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
