<script lang="ts">
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import type { ArtistWithTradeRow, SalesTotalData } from '$lib/db';
	import MonthTabReportTable from '$lib/Component/MonthTabReportTable.svelte';
	import db, { onePageLength } from '$lib/db';
	import { ThisMonthFirstDate } from '$lib/function/Utils';
	import MonthTab from './reportComponent/MonthTab.svelte';
	import { selectedStore } from '$lib/store/choosing';
	import type { DateRange } from '$lib/type';

	interface Props {
		artist_id: number;
	}

	let { artist_id }: Props = $props();
	let store_list: string[] | '*';
	let tradeDataList: ArtistWithTradeRow[] = $state([]);
	let nowPage: string = $state('0');
	let total: SalesTotalData = $state({
		sales_total: 0,
		net_total: 0,
		discount_total: 0,
		total_quantity: 0
	});
	let pageIndex: string[] = $state([]);
	let dateRange: DateRange;
	let min_year: number | null = $state(null);
	let unsubscribe = selectedStore.subscribe(async (e) => {
		store_list = $selectedStore;
		await refreshByStoreList();
	});
	onDestroy(() => {
		unsubscribe();
	});
	onMount(async () => {
		store_list = $selectedStore;
		await DateChange({ firstDate: ThisMonthFirstDate(-1), lastDate: ThisMonthFirstDate() });
		const { data, error } = await db.GetTradeDataMinYear();
		if (error) {
			console.error(error);
			return;
		}
		min_year = data;
	});
	async function refreshByStoreList() {
		if (dateRange) await DateChange(dateRange);
	}
	const DateChange = async (dateRange: DateRange) => {
		const { firstDate, lastDate } = dateRange;
		const { count } = await db.GetTradeDataCount(artist_id, store_list, { firstDate, lastDate });

		pageIndex = [];
		for (let i = 1; i <= Math.ceil((count ?? 0) / onePageLength); i++) {
			pageIndex.push(i.toString());
		}
		pageIndex = pageIndex;
		nowPage = pageIndex[0] ?? '0';
		tradeDataList = (await UpdateTradeData()) ?? [];
		if (firstDate === null || lastDate === null) {
			return;
		}
		await UpdateTotalData({ firstDate, lastDate });
		dispatch('change', {
			net_total: total.net_total,
			firstDate,
			lastDate,
			showedLength: count ?? 0
		});
	};

	async function UpdateTotalData(dateRange: { firstDate: Date; lastDate: Date }) {
		total = await db.GetTradeTotal(artist_id, store_list, dateRange.firstDate, dateRange.lastDate);
	}
	const dispatch = createEventDispatcher<{
		change: { net_total: number; firstDate: Date; lastDate: Date; showedLength: number };
	}>();
	const UpdateTradeData = async () => {
		const { data } = await db.artistTrade.GetTradeDataWithPage({
			id: artist_id,
			date: dateRange,
			page: parseInt(nowPage) - 1,
			store_list
		});
		return data;
	};
	const PageChange = async () => {
		const { data } = await db.artistTrade.GetTradeDataWithPage({
			id: artist_id,
			date: dateRange,
			page: parseInt(nowPage) - 1,
			store_list
		});
		return data;
	};
</script>

{#if tradeDataList && min_year}
	<MonthTabReportTable
		{min_year}
		{tradeDataList}
		bind:totalData={total}
		onDateRangeChange={async (e) => {
			dateRange = e;
			await DateChange(e);
		}}
	></MonthTabReportTable>
	<MonthTab
		tabDataList={pageIndex}
		initShowedMonth={nowPage}
		shape="full"
		monthChange={async () => {
			tradeDataList = (await PageChange()) ?? [];
		}}
	></MonthTab>
{/if}
