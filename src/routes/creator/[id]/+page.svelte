<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import type { ActionResult } from '@sveltejs/kit';
	import { deserialize } from '$app/forms';
	import type { QueryTradeBodyWithTradeHead } from '$lib/db';
	import LeleBox from '$lib/Component/LeleBox.svelte';
	import MonthTabReportTable from '$lib/Component/MonthTabReportTable.svelte';
	import OkButton from '$lib/UrlBox.svelte';
	import { GetYearMonth } from '$lib/function/Utils';

	let artist_name: string = '';
	let net_total = -1;
	let commission = 0;
	let artist_id: string = '';
	export let data: PageData;
	let admit = false;
	let admit_fail = false;
	let tradeDataList: QueryTradeBodyWithTradeHead = [];
	let showedLength = 0;

	let firstDay: Date;
	let lastDay: Date;
	onMount(() => {
		artist_name = data.artist_name as string;
		artist_id = data.id;
		let date = new Date();
		firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1);
		lastDay = new Date(date.getFullYear(), date.getMonth(), 1);
		UpdateTradeData(firstDay, lastDay);
	});
	const noCommisionText = '這個月優惠，不抽成喔';
	const SubmitKey = async (event: { currentTarget: EventTarget & HTMLFormElement }) => {
		const data = new FormData(event.currentTarget);
		data.append('id', artist_id);
		const date = new Date();
		let firstDate: Date = new Date(date.getFullYear(), date.getMonth() - 1, 1);
		let lastDate: Date = new Date(date.getFullYear(), date.getMonth(), 1);
		data.append('firstDate', firstDate.toISOString());
		data.append('lastDate', lastDate.toISOString());

		const response = await fetch(event.currentTarget.action, {
			method: 'POST',
			body: data
		});
		const result: ActionResult = deserialize(await response.text());
		if (result.type === 'success') {
			admit = result.data?.admit;
			tradeDataList = result.data?.tradeData;
		} else {
			admit_fail = true;
		}
	};
	let submitLog = '';

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
			UpdateDownloadData(tradeDataList);
		}
	};
	const UpdateDownloadData = (data: QueryTradeBodyWithTradeHead) => {
		encodeDataForDownload = '日期,收據號碼,商品,數量,銷售總額,折扣,淨銷售額%0A';
		data.forEach((element) => {
			encodeDataForDownload += element.trade_head?.trade_date + ',';
			encodeDataForDownload += element.trade_head?.trade_id + ',';
			encodeDataForDownload += element.item_name + ',';
			encodeDataForDownload += element.quantity + ',';
			encodeDataForDownload += element.total_sales + ',';
			encodeDataForDownload += element.discount + ',';
			encodeDataForDownload += element.net_sales + '%0A';
		});
	};
	const UpdateCommissionData = (data: QueryTradeBodyWithTradeHead) => {
		net_total = 0;
		data.forEach((element) => {
			net_total += element.net_sales ?? 0;
		});
		commission = net_total >= 0 ? Math.floor(net_total * 0.1) : 0;
	};
	let encodeDataForDownload = '';
</script>

<div class="flex flex-col items-center gap-3">
	{#if !admit}
		<h1 class="p-5 text-center text-3xl font-bold">{artist_name}</h1>
		<form action="?/GetTradeData" on:submit|preventDefault={SubmitKey} class="flex">
			<input type="password" id="password" name="password" required />

			<LeleBox>
				<button type="submit" class="h-full w-full bg-lele-line px-2 font-bold text-lele-bg"
					>submit</button
				>
			</LeleBox>
			{#if admit_fail}
				<div>Password wrong</div>
			{/if}
		</form>
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

			<OkButton>
				<a
					href={'data:text/plain;charset=utf-8,' + encodeDataForDownload}
					download="data.csv"
					class="inline-block w-full py-2">download</a
				>
			</OkButton>
		</div>
		<div
			class="flex gap-2 rounded-xl border-4 border-lele-line bg-lele-bg p-2 text-center text-sm font-semibold text-lele-line"
		>
			<div>
				{data.paymentStatus?.year_month}的繳費狀態：{data.paymentStatus?.process_state}
			</div>
		</div>
		<MonthTabReportTable
			bind:tradeDataList
			on:changeShowedDataList={(e) => {
				console.log('get dispatch');
				UpdateTradeData(e.detail.firstDay, e.detail.lastDay);
			}}
		></MonthTabReportTable>
	{/if}
</div>
