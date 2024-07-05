<script lang="ts">
	import type { PaymentStatusRow, PaymentStatusUpdate } from '$lib/db';
	import LeleTable from '$lib/Component/htmlWrapper/LeleTable.svelte';
	import LeleThead from '$lib/Component/htmlWrapper/LeleThead.svelte';
	import LeleTbody from '$lib/Component/htmlWrapper/LeleTbody.svelte';
	import LeleTbodyTr from '$lib/Component/htmlWrapper/LeleTbodyTr.svelte';
	import { onMount } from 'svelte';
	import db from '$lib/db';
	import { PreInsertPaymentStatus } from './leleFunction';
	import { GetSeason, GetYearMonth } from '$lib/function/Utils';
	import { invalidate, invalidateAll } from '$app/navigation';
	import Toggle from '$lib/Component/Toggle.svelte';
	import PaymentToggle from './paymentToggle.svelte';

	let nowSeasonPaymentDataList: {
		id: number;
		artist_name: string | null;
		visible: boolean;
		artist_payment_status: PaymentStatusRow[];
	}[] = [];

	let nextSeasonPaymentDataList: {
		id: number;
		artist_name: string | null;
		visible: boolean;
		artist_payment_status: PaymentStatusRow[];
	}[] = [];
	let checked: { [id: number]: boolean } = {};

	onMount(async () => {
		const result = await db.GetArtistDataWithPaymentStatus({ visible: null });
		const date = new Date();
		const result1 = await db.GetArtistDataWithPaymentStatus({
			visible: null,
			year_month_list: [GetSeason(date, 3), GetSeason(date, 4), GetSeason(date, 5)]
		});
		nextSeasonPaymentDataList = result1.data ?? [];

		if (result.data) {
			if (
				!result.data.every((element) => {
					return element.artist_payment_status.length === 3;
				})
			) {
				await PreInsertPaymentStatus(GetSeason(date, 0));
				await PreInsertPaymentStatus(GetSeason(date, 1));
				await PreInsertPaymentStatus(GetSeason(date, 2));
				invalidateAll();
			}
		}
		if (result1.data) {
			if (
				!result1.data.every((element) => {
					return element.artist_payment_status.length === 3;
				})
			) {
				await PreInsertPaymentStatus(GetSeason(date, 3));
				await PreInsertPaymentStatus(GetSeason(date, 4));
				await PreInsertPaymentStatus(GetSeason(date, 5));
				invalidateAll();
			}
		}

		nowSeasonPaymentDataList = result.data ?? [];
		console.log(nowSeasonPaymentDataList);
		nowSeasonPaymentDataList.forEach((element) => {
			element.artist_payment_status.forEach((element1) => {
				checked[element1.id] = 'done' === element1.process_state;
			});
		});
		nextSeasonPaymentDataList.forEach((element) => {
			element.artist_payment_status.forEach((element1) => {
				checked[element1.id] = 'done' === element1.process_state;
			});
		});
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
					<PaymentToggle bind:checked bind:paymentStatusRows={p.artist_payment_status}
					></PaymentToggle>
				</td>

				<td>
					<div class="flex flex-col justify-around gap-2 py-2">
						<PaymentToggle
							bind:checked
							bind:paymentStatusRows={nextSeasonPaymentDataList[index].artist_payment_status}
						></PaymentToggle>
					</div>
				</td>
			</LeleTbodyTr>
		{/each}
	</LeleTbody>
</LeleTable>
