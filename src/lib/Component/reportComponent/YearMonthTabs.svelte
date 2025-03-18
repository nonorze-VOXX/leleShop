<script lang="ts">
	import { YearMonth } from '$lib/class/YearMonth';
	import MonthTab from './MonthTab.svelte';
	import YearTab from './YearTab.svelte';

	interface Props {
		tabDataList: string[];
		yearRange: { min: number; max: number };
		yearMonthChange: (yearMonth: YearMonth) => void;
		initYearMonth: YearMonth;
	}

	let { initYearMonth, tabDataList, yearRange, yearMonthChange }: Props = $props();

	let yearMonth: YearMonth = $state(initYearMonth);

	const yearChange = (year: number) => {
		yearMonth.year = year;
		// console.log('year change' + yearMonth);
		yearMonthChange(yearMonth);
	};
	const monthChange = (month: number) => {
		yearMonth.month = month;
		// console.log('month change' + yearMonth);
		yearMonthChange(yearMonth);
	};
</script>

<div class="flex w-full flex-col">
	<YearTab shape="full" showedYear={yearMonth.year.toString()} {yearRange} {yearChange}></YearTab>
	<MonthTab {tabDataList} initShowedMonth={yearMonth.month.toString()} {monthChange}></MonthTab>
</div>
