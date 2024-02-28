<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import type { ActionResult } from '@sveltejs/kit';
	import { invalidateAll } from '$app/navigation';
	import { deserialize } from '$app/forms';
	import type { TradeBody, TradeHead } from '$lib/db';
	import LeleBox from '$lib/Component/LeleBox.svelte';

	let artist_name: string = '';
	let total = 0;
	let net_total = -1;
	let discount_total = 0;
	let commission = 0;
	let total_quantity = 0;
	let artist_id: string = '';
	export let data: PageData;
	let admit = false;
	let admit_fail = false;
	let tradeDataList: TradeBody[] = [];
	let tradeHeadList: TradeHead[] = [];
	let showedTradeDataList: TradeBody[] = [];
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
			tradeHeadList = tradeDataList.map((e) => e.trade_head);
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
		UpdateTotalData(showedTradeDataList);
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

		console.log(tabDataList);
	};

	const UpdateTotalData = (data: TradeBody[]) => {
		total = 0;
		net_total = 0;
		discount_total = 0;
		total_quantity = 0;
		data.forEach((element) => {
			total += element.total_sales ? element.total_sales : 0;
			net_total += element.net_sales ? element.net_sales : 0;
			discount_total += element.discount ? element.discount : 0;
			total_quantity += element.quantity ? element.quantity : 0;
		});
		commission = net_total >= 2000 ? Math.floor(net_total * 0.1) : 0;
	};
</script>

<div class="flex flex-col gap-3 items-center">
	<h1 class="text-center p-5 text-3xl font-bold">{artist_name}</h1>
	{#if !admit}
		<form action="?/GetTradeData" on:submit|preventDefault={SubmitKey} class="flex">
			<input type="password" id="password" name="password" required />

			<LeleBox>
				<button type="submit" class="w-full h-full bg-lele-line text-lele-bg font-bold"
					>submit</button
				>
			</LeleBox>
			{#if admit_fail}
				<div>Password wrong</div>
			{/if}
		</form>
	{:else}
		<div class="w-full flex justify-between">
			<div></div>
			{#if net_total != -1}
				<div class="text-center text-xl font-bold">
					<p class="inline">抽成10%:</p>
					{#if net_total >= 2000}
						{commission}
					{:else}
						{noCommisionText}
					{/if}
				</div>
			{/if}
		</div>
		{#if data}
			<div>
				<div class="flex justify-start px-2">
					{#each tabDataList as tabData}
						<div
							class="border-t-4 border-l-4 border-r-4 border-lele-line px-1 rounded-t-xl font-semibold"
						>
							{tabData}
						</div>
					{/each}
				</div>

				<div class="border-lele-line max-h-screen w-full border-2 rounded-lg overflow-auto">
					<table class="min-w-fit text-left text-sm font-medium table-fixed w-full relative">
						<thead class="shadow-lg text-lele-bg font-semibold text-sm bg-lele-line sticky top-0">
							<th scope="col" class="py-2 px-4 w-20"> 日期 </th>
							<th scope="col" class="py-2 px-4 w-20"> 收據號碼 </th>
							<th scope="col" class="py-2 px-4 w-40"> 商品 </th>
							<th scope="col" class="py-2 px-4 w-16"> 數量 </th>
							<th scope="col" class="py-2 px-4 w-16"> 銷售總額 </th>
							<th scope="col" class="py-2 px-4 w-16"> 折扣 </th>
							<th scope="col" class="py-2 px-4 w-16"> 淨銷售額 </th>
						</thead>

						<tbody class="overflow-y-auto">
							<tr
								class=" border-b transition duration-300 ease-in-out hover:bg-neutral-100 dark:border-neutral-500 dark:hover:bg-neutral-300"
							>
								<td></td>
								<td></td>
								<td class="py-2 px-4">總和</td>
								<td class="py-2 px-4">{total_quantity}</td>
								<td class="py-2 px-4">
									{total}
								</td>
								<td class="py-2 px-4">
									{discount_total}
								</td>
								<td class="py-2 px-4">
									{net_total}
								</td>
							</tr>
							{#each showedTradeDataList as trade}
								<tr
									class=" border-b transition duration-300 ease-in-out hover:bg-neutral-100 dark:border-neutral-500 dark:hover:bg-neutral-300"
								>
									<td class="py-2 px-4">
										<p>
											{trade.trade_head?.trade_date?.split('+')[0].split('T')[0]}
										</p>
										<!-- <p>
										{trade.trade_head?.trade_date?.split('+')[0].split('T')[1]}
									</p> -->
									</td>
									<td class="py-2 px-4"> {trade.trade_id}</td>
									<td class="py-2 px-4"> {trade.item_name}</td>
									<td class="py-2 px-4"> {trade.quantity}</td>
									<td class="py-2 px-4"> {trade.total_sales}</td>
									<td class="py-2 px-4"> {trade.discount}</td>
									<td class="py-2 px-4"> {trade.net_sales}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}
	{/if}
</div>
