<script lang="ts">
	import { deserialize } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { PaymentStatusRow } from '$lib/db';
	import LeleTable from '$lib/Component/htmlWrapper/LeleTable.svelte';
	import LeleThead from '$lib/Component/htmlWrapper/LeleThead.svelte';
	import LeleTbody from '$lib/Component/htmlWrapper/LeleTbody.svelte';
	import LeleTbodyTr from '$lib/Component/htmlWrapper/LeleTbodyTr.svelte';
	import { onMount } from 'svelte';
	import db from '$lib/db';
	import { PreInsertPaymentStatus } from './leleFunction';
	import { GetYearMonth } from '$lib/function/Utils';

	let paymentDataList: {
		id: number;
		artist_name: string | null;
		visible: boolean;
		artist_payment_status: PaymentStatusRow[];
	}[] = [];

	onMount(async () => {
		const result = await db.GetArtistDataWithPaymentStatus({ visible: null });
		await PreInsertPaymentStatus(GetYearMonth());
		await PreInsertPaymentStatus(GetYearMonth(1));
		await PreInsertPaymentStatus(GetYearMonth(2));
		await PreInsertPaymentStatus(GetYearMonth(3));
		paymentDataList = result.data ?? [];
	});

	const UpdatePaymentStatus = async (paymentData: PaymentStatusRow) => {
		const data = new FormData();

		if (
			paymentData.year_month === null ||
			paymentData.process_state === null ||
			paymentData.artist_id === null ||
			paymentData.id === null
		) {
			console.log('data error please connect to developer');
			return;
		}
		const state = paymentData.process_state === 'done' ? 'todo' : 'done';
		console.log(paymentData.year_month);

		data.append('season', paymentData.year_month);
		data.append('process_state', state);
		data.append('artist_id', paymentData.artist_id.toString());
		data.append('payment_id', paymentData.id.toString());

		const response = await fetch('?/UpdatePaymentStatus', {
			method: 'POST',
			body: data
		});
		const result = deserialize(await response.text());
		console.log(result);
		if (result.type === 'success') {
			console.log('succ');
		} else if (result.type === 'failure') {
			console.log(result.data);
		} else if (result.type === 'redirect') {
			goto(result.location);
		}
	};
</script>

<LeleTable>
	<LeleThead>
		<tr>
			<th scope="col" class="w-auto p-2"> 品牌 </th>
			<th scope="col" class="w-40 p-2"> 繳交狀況</th>
		</tr>
	</LeleThead>
	<LeleTbody>
		{#each paymentDataList as p}
			<LeleTbodyTr>
				<td class="p-2">
					{p.artist_name}
				</td>
				<td>
					<div class="flex flex-col justify-around gap-2 py-2">
						{#each p.artist_payment_status as pay}
							<div class="flex justify-start gap-2 align-baseline">
								<div class="">
									{pay.year_month}
								</div>
								<label class="inline-flex cursor-pointer items-center">
									<input
										type="checkbox"
										checked={pay.process_state === 'done'}
										on:change={() => {
											UpdatePaymentStatus(pay);
										}}
										class="peer sr-only"
									/>
									<div
										class="peer relative z-10 h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-0 peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"
									></div>
								</label>
							</div>
						{/each}
					</div>
				</td>
			</LeleTbodyTr>
		{/each}
	</LeleTbody>
</LeleTable>
