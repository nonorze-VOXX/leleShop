<script lang="ts">
	import type { QueryTradeBodyWithTradeHead, TradeHead } from '$lib/db';
	import ReportTable from './ReportTable.svelte';
	import { createEventDispatcher } from 'svelte';
	import { FormatDate } from './Utils';

	export let tradeDataList: QueryTradeBodyWithTradeHead;
	let showedTradeDataList: QueryTradeBodyWithTradeHead;
	let tabDataList: string[] = [];
	const date = new Date();
	let firstDay: Date = new Date(date.getFullYear(), date.getMonth() - 1, 1);
	let lastDay: Date = new Date(date.getFullYear(), date.getMonth(), 1);
	const GetTabDataList = (data: TradeHead[]) => {
		const monthSet = new Set(
			data.map((element) => element.trade_date?.split('+')[0].split('T')[0].split('-')[1] as string)
		);
		const monstList = Array.from(monthSet);
		return monstList.sort((a, b) => parseInt(a) - parseInt(b));
	};
	tabDataList = GetTabDataList(tradeDataList.map((e) => e.trade_head) as TradeHead[]);
	showedTradeDataList = tradeDataList;
	const GetShowedTradeDataList = () => {
		const filteredTradeDataList = tradeDataList.filter((element) => {
			return (
				element.trade_head &&
				element.trade_head.trade_date &&
				new Date(element.trade_head.trade_date) >= firstDay &&
				new Date(element.trade_head.trade_date) < lastDay
			);
		});

		return filteredTradeDataList;
	};
	const dispatch = createEventDispatcher<{
		clickTab: { showedTradeDataList: QueryTradeBodyWithTradeHead };
	}>();
	const ClickTab = (tabData: string) => {
		const date = new Date();
		firstDay = new Date(date.getUTCFullYear(), parseInt(tabData) - 1, 1);
		lastDay = new Date(date.getUTCFullYear(), parseInt(tabData), 1);
		showedTradeDataList = [...GetShowedTradeDataList()];
		dispatch('clickTab', {
			showedTradeDataList
		});
	};
	ClickTab((firstDay.getMonth() + 1).toString());
</script>

<button on:click={() => ClickTab('1')}>1</button>
<button on:click={() => ClickTab('2')}>2</button>
<button on:click={() => ClickTab('3')}>3</button>

<div class="flex w-full flex-col">
	<div class="flex justify-start px-2">
		{#each tabDataList as tabData}
			<div
				class="rounded-t-xl border-l-4 border-r-4 border-t-4 border-lele-line px-1 font-semibold"
			>
				<button on:click={() => ClickTab(tabData)}>
					{tabData}
				</button>
			</div>
		{/each}
	</div>
	<ReportTable bind:showedTradeDataList></ReportTable>
</div>
