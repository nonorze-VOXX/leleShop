<script lang="ts">
	import type { ArtistWithTradeRow, SalesTotalData } from '$lib/db';
	import { GetAllMonth } from '$lib/function/Utils';
	import ReportTable from './reportComponent/ReportTable.svelte';
	import { createEventDispatcher } from 'svelte';
	import YearMonthTabs from './reportComponent/YearMonthTabs.svelte';
	import { YearMonth } from '$lib/class/YearMonth';

	interface Props {
		tradeDataList: ArtistWithTradeRow[];
		totalData: SalesTotalData;
		min_year: number;
	}

	let { tradeDataList, totalData = $bindable(), min_year }: Props = $props();
	let showedTradeDataList: ArtistWithTradeRow[] = $derived(tradeDataList);
	let tabDataList: string[] = GetAllMonth();
	let yearMonth: YearMonth = $state(YearMonth.now().getPreviousMonth());
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

	
</script>

<div class="flex w-full flex-col">
	<YearMonthTabs
		{tabDataList}
		{yearMonth}
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
