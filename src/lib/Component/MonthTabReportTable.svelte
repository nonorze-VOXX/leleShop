<script lang="ts">
	import type { ArtistWithTradeRow, SalesTotalData } from '$lib/db';
	import { FormatNumberToTwoDigi, GetAllMonth, ThisMonthFirstDate } from '$lib/function/Utils';
	import ReportTable from './ReportTable.svelte';
	import { createEventDispatcher } from 'svelte';
	import MonthTab from './MonthTab.svelte';
	import YearTab from './YearTab.svelte';

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
		const date = new Date();
		let firstDay = new Date(date.getFullYear(), parseInt(tabData) - 1, 1);
		let lastDay = new Date(date.getFullYear(), parseInt(tabData), 1);
		dispatch('changeShowedDataList', {
			firstDay: firstDay,
			lastDay: lastDay
		});
	};
	const ClickYearTab = (tabData: string) => {
		showedYear = tabData;
		const date = new Date();
		let firstDay = new Date(parseInt(tabData), date.getMonth(), 1);
		let lastDay = new Date(parseInt(tabData), date.getMonth() + 1, 1);
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
	<YearTab
		shape="full"
		bind:showedYear
		{yearRange}
		on:onTabChange={(e) => {
			ClickYearTab(e.detail.showedYear);
		}}
	></YearTab>
	<MonthTab
		bind:tabDataList
		bind:showedMonth
		on:onTabChange={(e) => {
			ClickTab(e.detail.showedMonth);
		}}
	></MonthTab>
	<ReportTable bind:showedTradeDataList bind:totalData></ReportTable>
</div>
