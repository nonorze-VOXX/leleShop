<script lang="ts">
	import type {
		ArtistWithTradeWithShopRow,
		QueryTradeBodyWithTradeHead,
		SalesTotalData
	} from '$lib/db';
	import { FormatNumberToTwoDigi, GetAllMonth, ThisMonthFirstDate } from '$lib/function/Utils';
	import ReportTable from './ReportTable.svelte';
	import { createEventDispatcher } from 'svelte';
	import MonthTab from './MonthTab.svelte';

	export let tradeDataList: ArtistWithTradeWithShopRow[];
	export let totalData: SalesTotalData;
	let showedTradeDataList: ArtistWithTradeWithShopRow[];
	let tabDataList: string[] = GetAllMonth();
	let firstDay: Date = ThisMonthFirstDate(-1);
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
	<ReportTable bind:showedTradeDataList bind:totalData></ReportTable>
</div>
