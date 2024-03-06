<script lang="ts">
	import type { QueryTradeBodyWithTradeHead, TradeHead } from '$lib/db';
	import ReportTable from './ReportTable.svelte';
	import { createEventDispatcher } from 'svelte';

	export let tradeDataList: QueryTradeBodyWithTradeHead;
	let showedTradeDataList: QueryTradeBodyWithTradeHead;
	let tabDataList: string[] = [
		'01',
		'02',
		'03',
		'04',
		'05',
		'06',
		'07',
		'08',
		'09',
		'10',
		'11',
		'12'
	];
	const date = new Date();
	let firstDay: Date = new Date(date.getFullYear(), date.getMonth() - 1, 1);
	let lastDay: Date = new Date(date.getFullYear(), date.getMonth(), 1);
	let showedMonth: string = GetMonthToMM((firstDay.getMonth() + 1).toString());
	const dispatch = createEventDispatcher<{
		changeShowedDataList: { firstDay: Date; lastDay: Date };
	}>();
	const ClickTab = (tabData: string) => {
		showedMonth = tabData;
		const date = new Date();
		firstDay = new Date(date.getFullYear(), parseInt(tabData) - 1, 1);
		lastDay = new Date(date.getFullYear(), parseInt(tabData), 1);
		dispatch('changeShowedDataList', {
			firstDay: firstDay,
			lastDay: lastDay
		});
	};

	function GetMonthToMM(month: string) {
		return month.length === 1 ? '0' + month : month;
	}
	ClickTab(showedMonth);
	$: {
		showedTradeDataList = tradeDataList;
	}
</script>

<div class="flex w-full flex-col">
	<div class="mx-2 flex justify-start overflow-auto">
		{#each tabDataList as tabData}
			<div
				class:bg-lele-bg={showedMonth !== tabData}
				class:text-lele-line={showedMonth !== tabData}
				class:bg-lele-line={showedMonth === tabData}
				class:text-lele-bg={showedMonth === tabData}
				class="rounded-t-xl border-l-4 border-r-4 border-t-4 border-lele-line px-1 font-semibold"
			>
				<button
					on:click={() => {
						ClickTab(tabData);
					}}
				>
					{tabData}
				</button>
			</div>
		{/each}
	</div>
	<ReportTable bind:showedTradeDataList></ReportTable>
</div>
