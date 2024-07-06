<script lang="ts">
	import type { PaymentStatusRow } from '$lib/db';
	import LeleTable from '$lib/Component/htmlWrapper/LeleTable.svelte';
	import LeleThead from '$lib/Component/htmlWrapper/LeleThead.svelte';
	import LeleTbody from '$lib/Component/htmlWrapper/LeleTbody.svelte';
	import LeleTbodyTr from '$lib/Component/htmlWrapper/LeleTbodyTr.svelte';
	import { onMount } from 'svelte';
	import db from '$lib/db';
	import PaymentToggle from './paymentToggle.svelte';
	import { GetSeason } from '$lib/function/Utils';

	let nowSeasonPaymentDataList: {
		id: number;
		artist_name: string | null;
		visible: boolean;
		artist_payment_status: PaymentStatusRow;
	}[] = [];

	onMount(async () => {
		var date = new Date();
		var season = GetSeason(date);
		const result = await db.GetArtistDataWithPaymentStatus({ visible: null, season });

		nowSeasonPaymentDataList = result.data ?? [];
		console.log(nowSeasonPaymentDataList);
	});
</script>

<LeleTable>
	<LeleThead>
		<tr>
			<th scope="col" class="w-40 p-2"> 品牌 </th>
			<th scope="col" class="w-40 p-2"> 繳交狀況1</th>
			<th scope="col" class="w-40 p-2"> 繳交狀況2</th>
		</tr>
	</LeleThead>
	<LeleTbody>
		{#each nowSeasonPaymentDataList as p, index}
			<LeleTbodyTr>
				<td class="p-2">
					{p.artist_name}
				</td>
				<td>
					<PaymentToggle
						bind:season={p.artist_payment_status.state_by_season}
						bind:paymentStatusRows={p.artist_payment_status}
					></PaymentToggle>
				</td>

				<td>
					<div class="flex flex-col justify-around gap-2 py-2">
						<!-- <PaymentToggle
							bind:checked
							bind:paymentStatusRows={nextSeasonPaymentDataList[index].artist_payment_status}
						></PaymentToggle> -->
					</div>
				</td>
			</LeleTbodyTr>
		{/each}
	</LeleTbody>
</LeleTable>
