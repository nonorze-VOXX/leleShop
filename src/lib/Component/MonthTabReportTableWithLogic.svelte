<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { QueryTradeBodyWithTradeHead, SalesTotalData } from '$lib/db';
	import MonthTabReportTable from '$lib/Component/MonthTabReportTable.svelte';
	import db from '$lib/db';
	import { ThisMonthFirstDate } from '$lib/function/Utils';

	export let artist_id: string;
	let tradeDataList: QueryTradeBodyWithTradeHead = [];

	let total: SalesTotalData = {
		sales_total: 0,
		net_total: 0,
		discount_total: 0,
		total_quantity: 0
	};
	onMount(async () => {
		const firstDay = ThisMonthFirstDate(-1);
		const lastDay = ThisMonthFirstDate();
		await UpdateTradeData(firstDay, lastDay);
	});

	const dispatch = createEventDispatcher<{
		change: { net_total: number; firstDate: Date; lastDate: Date; showedLength: number };
	}>();
	const UpdateTradeData = async (firstDate: Date, lastDate: Date) => {
		total = await db.GetTradeTotal(parseInt(artist_id), firstDate, lastDate);

		const { data } = await db.GetTradeData(artist_id, {
			firstDate,
			lastDate
		});
		tradeDataList = data;
		dispatch('change', {
			net_total: total.net_total,
			firstDate,
			lastDate,
			showedLength: tradeDataList.length
		});
	};
</script>

{#if tradeDataList}
	<MonthTabReportTable
		bind:tradeDataList
		bind:totalData={total}
		on:changeShowedDataList={async (e) => {
			await UpdateTradeData(e.detail.firstDay, e.detail.lastDay);
		}}
	></MonthTabReportTable>
{/if}
