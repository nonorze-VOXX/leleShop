<script lang="ts">
	import type { QueryTradeBodyWithTradeHead, TradeHead } from '$lib/db';
	import ReportTable from './ReportTable.svelte';
	import { createEventDispatcher } from 'svelte';
	import { FormatDate } from './Utils';

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
	const dispatch = createEventDispatcher<{
		changeShowedDataList: { firstDay: Date; lastDay: Date };
	}>();
	const ClickTab = (tabData: string) => {
		const date = new Date();
		firstDay = new Date(date.getFullYear(), parseInt(tabData) - 1, 1);
		lastDay = new Date(date.getFullYear(), parseInt(tabData), 1);
		dispatch('changeShowedDataList', {
			firstDay: firstDay,
			lastDay: lastDay
		});
	};
	ClickTab((firstDay.getMonth() + 1).toString());
	$: {
		showedTradeDataList = tradeDataList;
	}
</script>

<div class="flex w-full flex-col gap-2">
	<div class="flex justify-start gap-2 px-2">
		{#each tabDataList as tabData}
			<div class="rounded-lg border-4 border-lele-line px-1 font-semibold">
				<button on:click={() => ClickTab(tabData)}>
					{tabData}
				</button>
			</div>
		{/each}
	</div>
	<ReportTable bind:showedTradeDataList></ReportTable>
</div>
