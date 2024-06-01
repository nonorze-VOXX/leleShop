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
		const result1 = await db.GetArtistDataWithPaymentStatus({
			visible: null,
			year_month_list: [GetSeason(3), GetSeason(4), GetSeason(5)]
		});
		nextSeasonPaymentDataList = result1.data ?? [];

		if (result.data) {
			if (
				!result.data.every((element) => {
					return element.artist_payment_status.length === 3;
				})
			) {
				await PreInsertPaymentStatus(GetSeason());
				await PreInsertPaymentStatus(GetSeason(1));
				await PreInsertPaymentStatus(GetSeason(2));
				invalidateAll();
			}
		}
		if (result1.data) {
			if (
				!result1.data.every((element) => {
					return element.artist_payment_status.length === 3;
				})
			) {
				await PreInsertPaymentStatus(GetSeason(3));
				await PreInsertPaymentStatus(GetSeason(4));
				await PreInsertPaymentStatus(GetSeason(5));
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

	const UpdatePaymentStatus = async (
		paymentData: PaymentStatusRow,
		artist_payment_status: {
			artist_id: number | null;
			id: number;
			process_state: 'todo' | 'doing' | 'done' | null;
			year_month: string;
		}[]
	) => {
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
		if (state === 'done') {
			console.log('state = done');
			for (let i = 0; i < artist_payment_status.length; i++) {
				const season = artist_payment_status[i].year_month;
				const process_state = state;
				const artist_id = paymentData.artist_id;
				const payment_id = artist_payment_status[i].id;
				const update: PaymentStatusUpdate = { artist_id, year_month: season, process_state };
				const { error } = await db.ChangePaymentStatus(update, payment_id);
				if (error) {
					console.error(error);
				} else {
					artist_payment_status[i].process_state = state;
					checked[artist_payment_status[i].id] = true;
				}
				if (artist_payment_status[i].year_month === paymentData.year_month) {
					break;
				}
			}
		} else {
			console.log('state = todo');
			const season = paymentData.year_month;
			const process_state = state;
			const artist_id = paymentData.artist_id;
			const payment_id = paymentData.id;
			const update: PaymentStatusUpdate = { artist_id, year_month: season, process_state };

			const { error } = await db.ChangePaymentStatus(update, payment_id);
			if (error) {
				console.error(error);
			} else {
				paymentData.process_state = state;
				checked[paymentData.id] = false;
			}
		}
	};
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
		{#each nowSeasonPaymentDataList as p}
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
						{#each nextSeasonPaymentDataList as p1}
							{#if p.id === p1.id}
								<PaymentToggle bind:checked bind:paymentStatusRows={p1.artist_payment_status}
								></PaymentToggle>
							{/if}
						{/each}
					</div>
				</td>
			</LeleTbodyTr>
		{/each}
	</LeleTbody>
</LeleTable>
