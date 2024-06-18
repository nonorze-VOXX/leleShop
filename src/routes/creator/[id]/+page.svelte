<script lang="ts">
	import PasswordPanel from './PasswordPanel.svelte';
	import DownloadButton from './DownloadButton.svelte';
	import { onMount } from 'svelte';
	import type { QueryTradeBodyWithTradeHead, SalesTotalData } from '$lib/db';
	import MonthTabReportTable from '$lib/Component/MonthTabReportTable.svelte';
	import db, { supabase } from '$lib/db';
	import { page } from '$app/stores';
	import { NextMonthFirstDate, ThisMonthFirstDate } from '$lib/function/Utils';
	import TradeCount from '$lib/Component/reportComponent/TradeCount.svelte';
	import Commision from '$lib/Component/reportComponent/Commision.svelte';

	let artist_name: string = '';
	let net_total = -1;
	let commission = 0;
	let artist_id: string = '';
	let admit = false;
	let tradeDataList: QueryTradeBodyWithTradeHead = [];
	let showedLength = 0;

	let total: SalesTotalData = {
		sales_total: 0,
		net_total: 0,
		discount_total: 0,
		total_quantity: 0
	};
	onMount(async () => {
		artist_id = $page.params.id;
		const artist_data = (await db.GetArtistData(artist_id)).data ?? [];
		artist_name = artist_data.length !== 0 ? artist_data[0].artist_name : 'not found this artist';
	});
	let queryTradeBodyWithTradeHead: QueryTradeBodyWithTradeHead;

	const UpdateTradeData = async (firstDate: Date, lastDate: Date) => {
		total = await db.GetTradeTotal(parseInt(artist_id), firstDate, lastDate);
		const { data } = await db.GetTradeData(artist_id, {
			firstDate,
			lastDate
		});
		tradeDataList = data;
		showedLength = tradeDataList.length as number;
		queryTradeBodyWithTradeHead = tradeDataList;
	};
</script>

<div class="flex flex-col items-center gap-3">
	{#if !admit}
		<PasswordPanel
			bind:artist_name
			bind:artist_id
			on:success={async () => {
				admit = true;
				const firstDate = ThisMonthFirstDate(-1);
				const lastDate = ThisMonthFirstDate();
				console.log(firstDate);
				console.log(lastDate);
				console.log(ThisMonthFirstDate(-2));
				await UpdateTradeData(firstDate, lastDate);
			}}
		></PasswordPanel>
	{:else if tradeDataList}
		<div class="flex flex-col justify-center gap-4 text-center text-sm font-semibold">
			<h1 class="rounded-xl border-4 border-lele-line bg-lele-bg p-2 text-lele-line">
				{artist_name}
			</h1>
			<Commision bind:net_total></Commision>
			<TradeCount bind:showedLength></TradeCount>
			{#if queryTradeBodyWithTradeHead}
				<DownloadButton bind:artist_name bind:queryTradeBodyWithTradeHead></DownloadButton>
			{/if}
		</div>
		<MonthTabReportTable
			bind:tradeDataList
			bind:totalData={total}
			on:changeShowedDataList={async (e) => {
				console.log('get dispatch');
				await UpdateTradeData(e.detail.firstDay, e.detail.lastDay);
			}}
			on:onTotalChange={(e) => {
				net_total = e.detail.net_total;
				commission = net_total >= 0 ? Math.floor(net_total * 0.1) : 0;
			}}
		></MonthTabReportTable>
	{/if}
</div>
