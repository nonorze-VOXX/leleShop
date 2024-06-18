<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type {
		QueryTradeBodyWithTradeHead as QueryTradeBodyWithTradeHead,
		SalesTotalData
	} from '$lib/db';
	import MonthTabReportTable from '$lib/Component/MonthTabReportTable.svelte';
	import db from '$lib/db';
	import { ThisMonthFirstDate } from '$lib/function/Utils';

	export let artist_id: string;
	let tradeDataList: QueryTradeBodyWithTradeHead = [];
	let showedLength = 0;
	let total: SalesTotalData = {
		sales_total: 0,
		net_total: 0,
		discount_total: 0,
		total_quantity: 0
	};
	onMount(async () => {
		const firstDay = ThisMonthFirstDate(-1);
		const lastDay = ThisMonthFirstDate();
		UpdateTradeData(firstDay, lastDay);
		total = await db.GetTradeTotal(parseInt(artist_id), firstDay, lastDay);
	});
	const dispatch = createEventDispatcher<{ change: { net_total: number } }>();
	const UpdateTradeData = async (firstDate: Date, lastDate: Date) => {
		total = await db.GetTradeTotal(parseInt(artist_id), firstDate, lastDate);
		dispatch('change', { net_total: total.net_total });
		const result: QueryTradeBodyWithTradeHead = (
			await db.GetTradeData(artist_id, {
				firstDate: firstDate,
				lastDate: lastDate
			})
		).data as QueryTradeBodyWithTradeHead;
		tradeDataList = result as QueryTradeBodyWithTradeHead;
		showedLength = tradeDataList.length as number;
	};
</script>

{#if tradeDataList}
	<MonthTabReportTable
		bind:totalData={total}
		bind:tradeDataList
		on:changeShowedDataList={(e) => {
			UpdateTradeData(e.detail.firstDay, e.detail.lastDay);
		}}
	></MonthTabReportTable>
{/if}
