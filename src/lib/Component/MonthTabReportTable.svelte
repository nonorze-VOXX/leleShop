<script lang="ts">
	import type { ArtistWithTradeRow, SalesTotalData } from '$lib/db';
	import { GetAllMonth } from '$lib/function/Utils';
	import ReportTable from './reportComponent/ReportTable.svelte';
	import YearMonthTabs from './reportComponent/YearMonthTabs.svelte';
	import { YearMonth } from '$lib/class/YearMonth';
	import type { DateRange } from '$lib/type';

	interface Props {
		tradeDataList: ArtistWithTradeRow[];
		totalData: SalesTotalData;
		min_year: number;
		onDateRangeChange: (dateRange: DateRange) => void;
	}

	let { onDateRangeChange, tradeDataList, totalData = $bindable(), min_year }: Props = $props();
	let tabDataList: string[] = GetAllMonth();

	let yearRange = { min: min_year, max: new Date().getFullYear() };
	const yearMonthChange = (yearMonth: YearMonth) => {
		onDateRangeChange({
			firstDate: yearMonth.getFirstTimePoint(),
			lastDate: yearMonth.getLastTimePoint()
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
	<ReportTable showedTradeDataList={tradeDataList} {totalData}></ReportTable>
</div>
