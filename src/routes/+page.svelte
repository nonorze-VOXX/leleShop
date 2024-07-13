<script lang="ts">
	import { onMount } from 'svelte';
	import type { AnonArtistListPaymentRow, PaymentStatusRow } from '$lib/db';
	import LeleThead from '$lib/Component/htmlWrapper/LeleThead.svelte';
	import LeleTbody from '$lib/Component/htmlWrapper/LeleTbody.svelte';
	import LeleTable from '$lib/Component/htmlWrapper/LeleTable.svelte';
	import LeleTbodyTr from '$lib/Component/htmlWrapper/LeleTbodyTr.svelte';
	import db, { supabase } from '$lib/db';
	import { GetSeason } from '$lib/function/Utils';
	let artistData: AnonArtistListPaymentRow[] = [];

	onMount(async () => {
		const { data, error } = await supabase
			.from('anon_artist_list_payment')
			.select('*')
			.eq('season', GetSeason(new Date()));
		if (error) {
			console.error(error);
		}
		artistData = data ?? [];
	});
</script>

<LeleTable>
	<LeleThead>
		<tr>
			<th scope="col" class="w-40 p-2"> 品牌 </th>
			<th scope="col" class="w-20 p-2 text-center"> 繳費 </th>
			<th scope="col" class="w-16 p-2 text-center"> 銷售 </th>
		</tr>
	</LeleThead>
	<LeleTbody>
		{#each artistData as artists}
			<LeleTbodyTr>
				<td class="p-2">
					{artists.artist_name}
				</td>
				<td class="text-center">
					<div class="text-lg">
						{#if artists.state_by_season}
							{#each { length: 3 } as _, i}
								{#if artists.state_by_season == null || i >= artists.state_by_season}
									X
								{:else}
									✓
								{/if}
							{/each}
						{:else}
							data missing
						{/if}
					</div>
				</td>
				<td class="flex">
					<a
						class="grow rounded-lg bg-lele-line p-2 text-center text-lele-bg"
						href={'/creator/' + artists.id + '?shop_id=1'}
					>
						報表
					</a>
				</td>
			</LeleTbodyTr>
		{/each}
	</LeleTbody>
</LeleTable>
