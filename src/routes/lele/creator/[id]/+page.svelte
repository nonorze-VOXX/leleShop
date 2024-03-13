<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import type { ActionResult } from '@sveltejs/kit';
	import { deserialize } from '$app/forms';
	import type {
		TradeBody,
		QueryTradeBodyWithTradeHead as QueryTradeBodyWithTradeHead,
		TradeHead
	} from '$lib/db';
	import LeleBox from '$lib/Component/LeleBox.svelte';
	import MonthTabReportTable from '$lib/Component/MonthTabReportTable.svelte';

	let artist_name: string = '';
	let net_total = -1;
	let commission = 0;
	let artist_id: string = '';
	export let data: PageData;
	let tradeDataList: QueryTradeBodyWithTradeHead = [];
	let showedLength = 0;
	onMount(() => {
		artist_name = data.artist_name as string;
		artist_id = data.id;
	});
	const noCommisionText = '這個月優惠，不抽成喔';
	const UpdateTradeData = async (firstDate: Date, lastDate: Date) => {
		const data = new FormData();
		data.append('firstDate', firstDate.toISOString());
		data.append('lastDate', lastDate.toISOString());
		const response = await fetch('?/UpdateTradeData', {
			method: 'POST',
			body: data
		});
		const result = deserialize(await response.text());
		if (result.type === 'success') {
			tradeDataList = result.data?.tradeDataList as QueryTradeBodyWithTradeHead;
			showedLength = tradeDataList.length as number;
			UpdateCommissionData(tradeDataList);
		}
	};
	const UpdateCommissionData = (data: QueryTradeBodyWithTradeHead) => {
		net_total = 0;
		data.forEach((element) => {
			net_total += element.net_sales ?? 0;
		});
		commission = net_total >= 0 ? Math.floor(net_total * 0.1) : 0;
	};
</script>

<div class="flex flex-col items-center gap-3">
	<div class="flex flex-col justify-center gap-4 text-center text-sm font-semibold">
		<h1 class="rounded-xl bg-lele-line p-2 text-lele-bg">{artist_name}</h1>
		{#if net_total != -1}
			<div class="flex rounded-xl bg-lele-line p-2 text-lele-bg">
				<p class="inline">抽成10%:</p>
				{#if net_total >= 0}
					{commission}
				{:else}
					{noCommisionText}
				{/if}
			</div>
		{/if}
		<div class="rounded-xl bg-lele-line p-2 text-lele-bg">
			交易次數：{showedLength}
		</div>
	</div>
	{#if data}
		<MonthTabReportTable
			bind:tradeDataList
			on:changeShowedDataList={(e) => {
				UpdateTradeData(e.detail.firstDay, e.detail.lastDay);
			}}
		></MonthTabReportTable>
	{/if}
</div>
