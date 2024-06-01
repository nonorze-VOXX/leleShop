<script lang="ts">
	import type { QueryTradeBodyWithTradeHead } from '$lib/db';
	import { FormatNumberToTwoDigi, GetAllMonth } from '$lib/function/Utils';
	import ReportTable from './ReportTable.svelte';
	import { createEventDispatcher } from 'svelte';
	import MonthTab from './MonthTab.svelte';

	export let tradeDataList: QueryTradeBodyWithTradeHead;
	let showedTradeDataList: QueryTradeBodyWithTradeHead;
	let tabDataList: string[] = GetAllMonth();
	const date = new Date();
	let firstDay: Date = new Date(date.getFullYear(), date.getMonth(), 1);
	// let lastDay: Date = new Date(date.getFullYear(), date.getMonth(), 1);
	let showedMonth: string = FormatNumberToTwoDigi((firstDay.getMonth() + 1).toString());
	const dispatch = createEventDispatcher<{
		changeShowedDataList: { firstDay: Date; lastDay: Date };
	}>();
	const ClickTab = (tabData: string) => {
		showedMonth = tabData;
		const date = new Date();
		let firstDay = new Date(date.getFullYear(), parseInt(tabData) - 1, 1);
		let lastDay = new Date(date.getFullYear(), parseInt(tabData), 1);
		console.log('dispatch');
		dispatch('changeShowedDataList', {
			firstDay: firstDay,
			lastDay: lastDay
		});
	};

	$: {
		showedTradeDataList = tradeDataList;
	}
</script>

<div class="flex w-full flex-col">
	<MonthTab
		bind:tabDataList
		bind:showedMonth
		on:onTabChange={(e) => {
			ClickTab(e.detail.showedMonth);
		}}
	></MonthTab>
	<ReportTable on:onTotalChange bind:showedTradeDataList></ReportTable>
</div>
