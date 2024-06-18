<script lang="ts">
	import { onMount } from 'svelte';
	import type {
		QueryTradeBodyWithTradeHead as QueryTradeBodyWithTradeHead,
		SalesTotalData
	} from '$lib/db';
	import MonthTabReportTable from '$lib/Component/MonthTabReportTable.svelte';
	import db from '$lib/db';
	import { page } from '$app/stores';
	import TradeCount from '$lib/Component/reportComponent/TradeCount.svelte';
	import Commision from '$lib/Component/reportComponent/Commision.svelte';
	import Remit from '$lib/Component/reportComponent/Remit.svelte';
	import { ThisMonthFirstDate } from '$lib/function/Utils';

	let artist_name: string = '';
	let artist_id: string = '';
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
		const firstDay = ThisMonthFirstDate(-1);
		const lastDay = ThisMonthFirstDate();
		UpdateTradeData(firstDay, lastDay);
		total = await db.GetTradeTotal(parseInt(artist_id), firstDay, lastDay);
	});
	let net_total: null | number = null;
	const UpdateTradeData = async (firstDate: Date, lastDate: Date) => {
		total = await db.GetTradeTotal(parseInt(artist_id), firstDate, lastDate);
		const result: QueryTradeBodyWithTradeHead = (
			await db.GetTradeData(artist_id, {
				firstDate: firstDate,
				lastDate: lastDate
			})
		).data as QueryTradeBodyWithTradeHead;
		tradeDataList = result as QueryTradeBodyWithTradeHead;
		showedLength = tradeDataList.length as number;
	};
</script>

<div class="flex flex-col items-center gap-3">
	<div class="flex flex-col justify-center gap-4 text-center text-sm font-semibold">
		<h1 class="rounded-xl bg-lele-line p-2 text-lele-bg">{artist_name}</h1>
		<Commision bind:net_total></Commision>
		<TradeCount bind:showedLength></TradeCount>
		<Remit bind:net_total></Remit>
	</div>
	{#if tradeDataList}
		<MonthTabReportTable
			bind:totalData={total}
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
