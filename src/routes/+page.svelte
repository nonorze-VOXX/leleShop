<script lang="ts">
	import { onMount } from 'svelte';
	import type { PaymentStatusRow } from '$lib/db';
	import LeleThead from '$lib/Component/htmlWrapper/LeleThead.svelte';
	import LeleTbody from '$lib/Component/htmlWrapper/LeleTbody.svelte';
	import LeleTable from '$lib/Component/htmlWrapper/LeleTable.svelte';
	import LeleTbodyTr from '$lib/Component/htmlWrapper/LeleTbodyTr.svelte';
	import db from '$lib/db';
	let artistData: {
		id: number;
		artist_name: string;
		visible: boolean;
		artist_payment_status: PaymentStatusRow[];
	}[] = [];

	onMount(async () => {
		const { data, error } = await db.GetArtistDataWithPaymentStatus();
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
						{#if artists.artist_payment_status.length !== 3}
							data missing
						{:else}
							{#each artists.artist_payment_status as paymentStatus}
								{#if paymentStatus.process_state === 'done'}
									✓
								{:else if paymentStatus.process_state === 'doing'}
									A
								{:else}
									X
								{/if}
							{/each}
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
	</LeleTbody>
</LeleTable>
