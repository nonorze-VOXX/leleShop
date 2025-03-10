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
	const dispatch = createEventDispatcher<{
		changeShowedDataList: { firstDay: Date; lastDay: Date };
	}>();

	let yearRange = { min: min_year, max: new Date().getFullYear() };
	const yearMonthChange = (yearMonth: YearMonth) => {
		dispatch('changeShowedDataList', {
			firstDay: yearMonth.getFirstTimePoint(),
			lastDay: yearMonth.getLastTimePoint()
		});
	};
</script>

<div class="flex w-full flex-col">
	<YearMonthTabs
		{tabDataList}
		initYearMonth={YearMonth.now().getPreviousMonth()}
		{yearRange}
		{yearMonthChange}
	></YearMonthTabs>
	<ReportTable {showedTradeDataList} {totalData}></ReportTable>
</div>
