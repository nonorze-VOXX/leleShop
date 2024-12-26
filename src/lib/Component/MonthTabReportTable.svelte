<script lang="ts">
	import type { ArtistWithTradeRow, SalesTotalData } from '$lib/db';
	import { FormatNumberToTwoDigi, GetAllMonth, ThisMonthFirstDate } from '$lib/function/Utils';
	import ReportTable from './ReportTable.svelte';
	import { createEventDispatcher } from 'svelte';
	import YearMonthTabs from './YearMonthTabs.svelte';

	export let tradeDataList: ArtistWithTradeRow[];
	export let totalData: SalesTotalData;
	export let min_year: number;
	let showedTradeDataList: ArtistWithTradeRow[];
	let tabDataList: string[] = GetAllMonth();
	let firstDay: Date = ThisMonthFirstDate(-1);
	let showedMonth: string = FormatNumberToTwoDigi((firstDay.getMonth() + 1).toString());
	let showedYear: string = firstDay.getFullYear().toString();
	const dispatch = createEventDispatcher<{
		changeShowedDataList: { firstDay: Date; lastDay: Date };
	}>();
	const ClickTab = (tabData: string) => {
		showedMonth = tabData;
		firstDay = new Date(parseInt(showedYear), parseInt(tabData) - 1, 1);
		const lastDay = new Date(parseInt(showedYear), parseInt(tabData), 1);
		dispatch('changeShowedDataList', {
			firstDay: firstDay,
			lastDay: lastDay
		});
	};
	const ClickYearTab = (tabData: string) => {
		showedYear = tabData;
		firstDay = new Date(parseInt(tabData), firstDay.getMonth(), 1);
		const lastDay = new Date(parseInt(tabData), firstDay.getMonth() + 1, 1);
		dispatch('changeShowedDataList', {
			firstDay: firstDay,
			lastDay: lastDay
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
		bind:showedMonth
		bind:showedYear
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
