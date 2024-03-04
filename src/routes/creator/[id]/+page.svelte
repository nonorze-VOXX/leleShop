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
	let admit = false;
	let admit_fail = false;
	let tradeDataList: QueryTradeBodyWithTradeHead = [];
	let showedLength = 0;
	onMount(() => {
		artist_name = data.artist_name as string;
		artist_id = data.id;
	});
	const noCommisionText = '這個月優惠，不抽成喔';
	const SubmitKey = async (event: { currentTarget: EventTarget & HTMLFormElement }) => {
		const data = new FormData(event.currentTarget);
		data.append('id', artist_id);

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

	const UpdateCommissionData = (data: QueryTradeBodyWithTradeHead) => {
		net_total = 0;
		data.forEach((element) => {
			net_total += element.net_sales ?? 0;
		});
		commission = net_total >= 2000 ? Math.floor(net_total * 0.1) : 0;
	};
	const OnShowedDataListChange = (showedTradeDataList: QueryTradeBodyWithTradeHead) => {
		UpdateCommissionData(showedTradeDataList);
		showedLength = showedTradeDataList.length;
	};
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
			<h1 class="rounded-xl bg-lele-line p-2 text-lele-bg">{artist_name}</h1>
			{#if net_total != -1}
				<div class="flex rounded-xl bg-lele-line p-2 text-lele-bg">
					<p class="inline">抽成10%:</p>
					{#if net_total >= 2000}
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
				on:clickTab={(e) => {
					OnShowedDataListChange(e.detail.showedTradeDataList);
				}}
			></MonthTabReportTable>
		{/if}
	{/if}
</div>
