<script lang="ts">
	import type { ArtistWithTradeRow, SalesTotalData } from '$lib/db';
	import { FormatNumberToTwoDigi, GetAllMonth, ThisMonthFirstDate } from '$lib/function/Utils';
	import ReportTable from './ReportTable.svelte';
	import { createEventDispatcher } from 'svelte';
	import YearMonthTabs from './YearMonthTabs.svelte';
	import { YearMonth } from '$lib/class/YearMonth';

	export let tradeDataList: ArtistWithTradeRow[];
	export let totalData: SalesTotalData;
	export let min_year: number;
	let showedTradeDataList: ArtistWithTradeRow[];
	let tabDataList: string[] = GetAllMonth();
	let yearMonth: YearMonth = YearMonth.now().getPreviousMonth();
	const dispatch = createEventDispatcher<{
		changeShowedDataList: { firstDay: Date; lastDay: Date };
	}>();
	const ClickTab = (tabData: string) => {
		yearMonth.month = Number(tabData);
		dispatch('changeShowedDataList', {
			firstDay: yearMonth.getFirstTimePoint(),
			lastDay: yearMonth.getLastTimePoint()
		});
	};
	const ClickYearTab = (tabData: string) => {
		yearMonth.year = Number(tabData);
		dispatch('changeShowedDataList', {
			firstDay: yearMonth.getFirstTimePoint(),
			lastDay: yearMonth.getLastTimePoint()
		});
	};

	let yearRange = { min: min_year, max: new Date().getFullYear() };

	$: {
		showedTradeDataList = tradeDataList;
	}
</script>

<div class="flex w-full flex-col">
	<YearMonthTabs
		bind:tabDataList
		bind:yearMonth
		{yearRange}
		on:onTabChange={(e) => {
			ClickTab(e.detail.showedMonth);
		}}
		on:onYearTabChange={(e) => {
			ClickYearTab(e.detail.showedYear);
		}}
	></YearMonthTabs>
	<ReportTable bind:showedTradeDataList bind:totalData></ReportTable>
</div>
