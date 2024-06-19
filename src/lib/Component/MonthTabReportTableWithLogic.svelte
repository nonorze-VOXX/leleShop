<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { QueryTradeBodyWithTradeHead, SalesTotalData } from '$lib/db';
	import MonthTabReportTable from '$lib/Component/MonthTabReportTable.svelte';
	import db, { onePageLength, supabase } from '$lib/db';
	import { ThisMonthFirstDate } from '$lib/function/Utils';
	import MonthTab from './MonthTab.svelte';

	export let artist_id: string;
	let tradeDataList: QueryTradeBodyWithTradeHead = [];
	let nowPage: string = '0';
	let total: SalesTotalData = {
		sales_total: 0,
		net_total: 0,
		discount_total: 0,
		total_quantity: 0
	};
	let pageIndex: string[] = [];
	let dateRange: { firstDate: Date; lastDate: Date };
	onMount(async () => {
		await DateChange(ThisMonthFirstDate(-1), ThisMonthFirstDate());
	});
	const DateChange = async (firstDate: Date, lastDate: Date) => {
		dateRange = { firstDate, lastDate };
		const { count } = await db.GetTradeDataCount(artist_id, { firstDate, lastDate });

		pageIndex = [];
		for (let i = 1; i <= Math.ceil((count ?? 0) / onePageLength); i++) {
			pageIndex.push(i.toString());
		}
		pageIndex = pageIndex;
		nowPage = pageIndex[0] ?? '0';
		tradeDataList = await UpdateTradeData(firstDate, lastDate);
		dispatch('change', {
			net_total: total.net_total,
			firstDate,
			lastDate,
			showedLength: count ?? 0
		});
	};

	const dispatch = createEventDispatcher<{
		change: { net_total: number; firstDate: Date; lastDate: Date; showedLength: number };
	}>();
	const UpdateTradeData = async (firstDate: Date, lastDate: Date) => {
		total = await db.GetTradeTotal(parseInt(artist_id), firstDate, lastDate);

		const { data } = await db.GetTradeData(artist_id, dateRange, parseInt(nowPage) - 1);
		return data;
	};
	const PageChange = async () => {
		const { data } = await db.GetTradeData(artist_id, dateRange, parseInt(nowPage) - 1);
		return data;
	};
</script>

{#if tradeDataList}
	<div class="flex flex-col">
		<MonthTabReportTable
			bind:tradeDataList
			bind:totalData={total}
			on:changeShowedDataList={async (e) => {
				await DateChange(e.detail.firstDay, e.detail.lastDay);
			}}
		></MonthTabReportTable>
		<MonthTab
			bind:tabDataList={pageIndex}
			bind:showedMonth={nowPage}
			shape="full"
			on:onTabChange={async (e) => {
				tradeDataList = await PageChange();
			}}
		></MonthTab>
	</div>
{/if}
