<script lang="ts">
	import MonthTab from './MonthTab.svelte';
	import YearTab from './YearTab.svelte';
	import { createEventDispatcher } from 'svelte';

	export let tabDataList: string[];
	export let showedMonth: string;
	export let showedYear: string;
	export let yearRange: { min: number; max: number };

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
	<YearTab shape="full" bind:showedYear {yearRange} on:onTabChange={handleYearTabChange}></YearTab>
	<MonthTab bind:tabDataList bind:showedMonth on:onTabChange={handleMonthTabChange}></MonthTab>
</div>
