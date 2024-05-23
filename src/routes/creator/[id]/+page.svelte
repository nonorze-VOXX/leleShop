<script lang="ts">
	import PasswordPanel from './PasswordPanel.svelte';
	import DownloadButton from './DownloadButton.svelte';
	import { onMount } from 'svelte';
	import type { QueryTradeBodyWithTradeHead } from '$lib/db';
	import MonthTabReportTable from '$lib/Component/MonthTabReportTable.svelte';
	import db from '$lib/db';
	import { page } from '$app/stores';

	let artist_name: string = '';
	let net_total = -1;
	let commission = 0;
	let artist_id: string = '';
	let admit = false;
	let tradeDataList: QueryTradeBodyWithTradeHead = [];
	let showedLength = 0;

	let firstDay: Date;
	let lastDay: Date;
	onMount(async () => {
		const params = $page.params.id;
		const artist_data = (await db.GetArtistData(params)).data ?? [];
		artist_name = artist_data.length !== 0 ? artist_data[0].artist_name : 'not found this artist';
		artist_id = params;
		let date = new Date();
		firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
		lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
		await UpdateTradeData(firstDay, lastDay);
	});
	const noCommisionText = '這個月優惠，不抽成喔';
	let queryTradeBodyWithTradeHead: QueryTradeBodyWithTradeHead;

	const UpdateTradeData = async (firstDate: Date, lastDate: Date) => {
		const { data } = await db.GetTradeData(artist_id, {
			firstDate,
			lastDate
		});
		console.log(firstDate, lastDate);
		tradeDataList = data;
		showedLength = tradeDataList.length as number;
		UpdateCommissionData(tradeDataList);
		queryTradeBodyWithTradeHead = tradeDataList;
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
	{#if !admit}
		<PasswordPanel
			bind:artist_name
			bind:artist_id
			on:success={(e) => {
				admit = true;
				//  UpdateTradeData(e.detail.firstDate, e.detail.lastDate);
			}}
		></PasswordPanel>
	{:else}
		<div class="flex flex-col justify-center gap-4 text-center text-sm font-semibold">
			<h1 class="rounded-xl border-4 border-lele-line bg-lele-bg p-2 text-lele-line">
				{artist_name}
			</h1>
			{#if net_total != -1}
				<div
					class="flex justify-center rounded-xl border-4 border-lele-line bg-lele-bg p-2 text-lele-line"
				>
					<p class="inline">抽成10%:</p>
					{#if net_total >= 0}
						{commission}
					{:else}
						{noCommisionText}
					{/if}
				</div>
			{/if}
			<div class=" rounded-xl border-4 border-lele-line bg-lele-bg p-2 text-center text-lele-line">
				交易次數：{showedLength}
			</div>

			<DownloadButton bind:artist_name bind:queryTradeBodyWithTradeHead></DownloadButton>
		</div>
		<MonthTabReportTable
			bind:tradeDataList
			on:changeShowedDataList={async (e) => {
				console.log('get dispatch');
				await UpdateTradeData(e.detail.firstDay, e.detail.lastDay);
			}}
		></MonthTabReportTable>
	{/if}
</div>
