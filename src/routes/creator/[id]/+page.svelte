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
	import LeleTbody from '$lib/Component/htmlWrapper/LeleTbody.svelte';
	import LeleThead from '$lib/Component/htmlWrapper/LeleThead.svelte';
	import LeleTable from '$lib/Component/htmlWrapper/LeleTable.svelte';
	import LeleTbodyTr from '$lib/Component/htmlWrapper/LeleTbodyTr.svelte';
	import ReportTable from '$lib/Component/ReportTable.svelte';

	let artist_name: string = '';
	let net_total = -1;
	let discount_total = 0;
	let commission = 0;
	let total_quantity = 0;
	let artist_id: string = '';
	export let data: PageData;
	let admit = false;
	let admit_fail = false;
	let tradeDataList: QueryTradeBodyWithTradeHead = [];
	let tradeHeadList: TradeHead[] = [];
	let showedTradeDataList: QueryTradeBodyWithTradeHead = [];
	let tabDataList: string[] = [];
	let firstDay: Date = new Date();
	let lastDay: Date = new Date();
	onMount(() => {
		artist_name = data.artist_name as string;
		artist_id = data.id;
		const date = new Date();
		firstDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1));
		lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
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
			tradeHeadList = tradeDataList
				.filter((e) => e.trade_head !== null) // Filter out null values
				.map((e) => e.trade_head);
			UpdateTabData(tradeHeadList);
			UpdateShowedTradeDataList();
		} else {
			admit_fail = true;
		}
	};
	const UpdateShowedTradeDataList = () => {
		const showedHeadList = tradeHeadList.filter(
			(element) =>
				element.trade_date &&
				new Date(element.trade_date) >= firstDay &&
				new Date(element.trade_date) < lastDay
		);
		showedTradeDataList = tradeDataList.filter((element) => {
			return showedHeadList.some((e) => e.trade_id === element.trade_id);
		});
		UpdateCommissionData(showedTradeDataList);
	};
	const UpdateTabData = (data: TradeHead[]) => {
		tabDataList = [];
		console.log(data);

		const monthList = data.map(
			(element) => element.trade_date?.split('+')[0].split('T')[0].split('-')[1] as string
		);
		monthList.forEach((m) => {
			if (!tabDataList.includes(m)) {
				tabDataList.push(m);
			}
		});
		tabDataList.sort((a, b) => parseInt(a) - parseInt(b));

		console.log(tabDataList);
	};

	const UpdateCommissionData = (data: QueryTradeBodyWithTradeHead) => {
		net_total = 0;
		data.forEach((element) => {
			net_total += element.net_sales ?? 0;
		});
		commission = net_total >= 2000 ? Math.floor(net_total * 0.1) : 0;
	};
</script>

<div class="flex flex-col items-center gap-3">
	{#if !admit}
		<h1 class="p-5 text-center text-3xl font-bold">{artist_name}</h1>
		<form action="?/GetTradeData" on:submit|preventDefault={SubmitKey} class="flex">
			<input type="password" id="password" name="password" required />

			<LeleBox>
				<button type="submit" class="h-full w-full bg-lele-line font-bold text-lele-bg"
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
				交易次數：{showedTradeDataList.length}
			</div>
		</div>
		{#if data}
			<div class="flex w-full flex-col">
				<div class="flex justify-start px-2">
					{#each tabDataList as tabData}
						<div
							class="rounded-t-xl border-l-4 border-r-4 border-t-4 border-lele-line px-1 font-semibold"
						>
							<button
								on:click={() => {
									firstDay = new Date(
										Date.UTC(firstDay.getUTCFullYear(), parseInt(tabData) - 1, 1)
									);
									lastDay = new Date(Date.UTC(firstDay.getUTCFullYear(), parseInt(tabData), 1));
									UpdateShowedTradeDataList();
								}}
							>
								{tabData}
							</button>
						</div>
					{/each}
				</div>
				<ReportTable bind:showedTradeDataList></ReportTable>
			</div>
		{/if}
	{/if}
</div>
