<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { deserialize } from '$app/forms';
	import type { QueryTradeBodyWithTradeHead as QueryTradeBodyWithTradeHead } from '$lib/db';
	import MonthTabReportTable from '$lib/Component/MonthTabReportTable.svelte';
	import { goto } from '$app/navigation';

	let artist_name: string = '';
	let artist_id: string = '';
	export let data: PageData;
	let tradeDataList: QueryTradeBodyWithTradeHead = [];
	let showedLength = 0;
	onMount(() => {
		artist_name = data.artist_name as string;
		artist_id = data.id;
		const date = new Date();
		const firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1);
		const lastDay = new Date(date.getFullYear(), date.getMonth(), 1);
		UpdateTradeData(firstDay, lastDay);
	});
	let net_total: null | number = null;
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
		} else if (result.type === 'redirect') {
			goto(result.location);
		}
	};
</script>

<div class="flex flex-col items-center gap-3">
	<div class="flex flex-col justify-center gap-4 text-center text-sm font-semibold">
		<h1 class="rounded-xl bg-lele-line p-2 text-lele-bg">{artist_name}</h1>
		{#if net_total != -1}
			<div class="flex justify-between rounded-xl bg-lele-line p-2 text-lele-bg">
				<p class="inline">抽成10%:</p>
				<div>
					{#if net_total !== null}
						{Math.floor(net_total * 0.1)}
					{:else}
						計算中
					{/if}
				</div>
			</div>
		{/if}
		<div class="flex justify-between rounded-xl bg-lele-line p-2 text-lele-bg">
			<p class="inline">交易次數：</p>
			<div>
				{showedLength}
			</div>
		</div>
		<div class="flex justify-between rounded-xl bg-lele-line p-2 text-lele-bg">
			<p class="inline">匯款金額：</p>
			<div>
				{#if net_total != null}
					{Math.floor(net_total * 0.9)}
				{:else}
					計算中
				{/if}
			</div>
		</div>
	</div>
	{#if data}
		<MonthTabReportTable
			bind:tradeDataList
			on:changeShowedDataList={(e) => {
				UpdateTradeData(e.detail.firstDay, e.detail.lastDay);
			}}
			on:onTotalChange={(e) => {
				net_total = e.detail.net_total;
			}}
		></MonthTabReportTable>
	{/if}
</div>
