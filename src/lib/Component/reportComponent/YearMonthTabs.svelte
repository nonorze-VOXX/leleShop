<script lang="ts">
	import type { YearMonth } from '$lib/class/YearMonth';
	import MonthTab from './MonthTab.svelte';
	import YearTab from './YearTab.svelte';
	import { createEventDispatcher } from 'svelte';

	interface Props {
		tabDataList: string[];
		yearMonth: YearMonth;
		yearRange: { min: number; max: number };
	}

	let { tabDataList, yearMonth, yearRange }: Props = $props();

	const dispatch = createEventDispatcher<{
		onTabChange: { showedMonth: string };
		onYearTabChange: { showedYear: string };
	}>();

	const handleMonthTabChange = (e: CustomEvent<{ showedMonth: string }>) => {
		dispatch('onTabChange', { showedMonth: e.detail.showedMonth });
	};

	const handleYearTabChange = (e: CustomEvent<{ showedYear: string }>) => {
		dispatch('onYearTabChange', { showedYear: e.detail.showedYear });
	};
</script>

<div class="flex w-full flex-col">
	<YearTab
		shape="full"
		showedYear={yearMonth.year.toString()}
		{yearRange}
		on:onTabChange={handleYearTabChange}
	></YearTab>
	<MonthTab
		{tabDataList}
		showedMonth={yearMonth.month.toString()}
		on:onTabChange={handleMonthTabChange}
	></MonthTab>
</div>
