<script lang="ts">
	import LeleDataTable from '$lib/Component/LeleDataTable.svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { deserialize } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { invalidateAll } from '$app/navigation';
	import type { Artist, TradeBodyWithTradeHead } from '$lib/db';

	export let data: PageData;

	let tableData: string[][];
	let tableHead: string[] = ['artist name'];
	let artistData: Artist[] = [];
	let tradeDataList: TradeBodyWithTradeHead;
	enum TabEnum {
		artist_list,
		trade,
		report_key
	}
	let tabType: TabEnum = TabEnum.artist_list;
	onMount(async () => {
		artistData = data.data as unknown as Artist[];
		tableData = data.data?.map((artist) => {
			return [artist.artist_name, artist.report_key];
		}) as string[][];
		tradeDataList = data.tradeDataList as TradeBodyWithTradeHead;
	});
	const ButtonFunction = async (value: string[]) => {
		const data = new FormData();
		const artist = artistData.find((e) => e.artist_name == value[0]);
		if (artist === undefined) {
			return;
		}
		if (artist.id === undefined) {
			return;
		}
		data.append('id', artist.id as string);
		const response = await fetch('?/UpdateReportKey', {
			method: 'POST',
			body: data
		});
		const result: ActionResult = deserialize(await response.text());
		console.log(result.type);
		if (result.type === 'success') {
			console.log('refresh');
			let artistIndex = tableData.findIndex((e) => e[0] === artist.artist_name);
			console.log(artistIndex);

			if (artistIndex !== undefined) {
				tableData[artistIndex][1] = result.data?.key;
			}
			await invalidateAll();
		}
	};
</script>

<div class="flex justify-start gap-2 p-2">
	<button
		on:click={() => (tabType = TabEnum.artist_list)}
		class="flex rounded-xl bg-lele-line p-2 font-semibold text-lele-bg">Artist List</button
	>
	<button
		class="flex rounded-xl bg-lele-line p-2 font-semibold text-lele-bg"
		on:click={() => (tabType = TabEnum.trade)}>Trade</button
	>
	<button
		class="flex rounded-xl bg-lele-line p-2 font-semibold text-lele-bg"
		on:click={() => (tabType = TabEnum.report_key)}>Manage Key</button
	>
</div>

{#if tabType === TabEnum.artist_list}
	<div class="flex h-fit w-screen flex-wrap gap-4 p-4">
		<div class="h-fit w-fit rounded-lg border-4 border-blue-700 p-3 text-5xl">
			<a href="/lele/importCsv">import csv</a>
		</div>
	</div>
{/if}
{#if tabType === TabEnum.trade}
	<!-- <div>trade</div>
				<div class="max-h-screen w-full overflow-x-auto rounded-lg border-2 border-lele-line">
					<table class="relative w-full table-fixed text-left text-sm font-medium">
						<thead class="sticky top-0 bg-lele-line text-sm font-semibold text-lele-bg shadow-lg">
							<th scope="col" class="w-20 px-4 py-2"> 日期 </th>
							<th scope="col" class="w-20 px-4 py-2"> 收據號碼 </th>
							<th scope="col" class="w-40 px-4 py-2"> 商品 </th>
							<th scope="col" class="w-16 px-4 py-2"> 數量 </th>
							<th scope="col" class="w-16 px-4 py-2"> 銷售總額 </th>
							<th scope="col" class="w-16 px-4 py-2"> 折扣 </th>
							<th scope="col" class="w-16 px-4 py-2"> 淨銷售額 </th>
						</thead>

						<tbody class="overflow-y-auto">
							<tr
								class=" border-b transition duration-300 ease-in-out hover:bg-neutral-100 dark:border-neutral-500 dark:hover:bg-neutral-300"
							>
								<td></td>
								<td></td>
								<td class="px-4 py-2">總和</td>
								<td class="px-4 py-2">{total_quantity}</td>
								<td class="px-4 py-2">
									{total}
								</td>
								<td class="px-4 py-2">
									{discount_total}
								</td>
								<td class="px-4 py-2">
									{net_total}
								</td>
							</tr>
							{#each showedTradeDataList as trade}
								<tr
									class=" border-b transition duration-300 ease-in-out hover:bg-neutral-100 dark:border-neutral-500 dark:hover:bg-neutral-300"
								>
									<td class="px-4 py-2">
										<p>
											{FormatDate(trade.trade_head?.trade_date)}
										</p>
									</td>
									<td class="px-4 py-2"> {trade.trade_id}</td>
									<td class="px-4 py-2"> {trade.item_name}</td>
									<td class="px-4 py-2"> {trade.quantity}</td>
									<td class="px-4 py-2"> {trade.total_sales}</td>
									<td class="px-4 py-2"> {trade.discount}</td>
									<td class="px-4 py-2"> {trade.net_sales}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div> -->
{/if}
{#if tabType === TabEnum.report_key}
	<LeleDataTable
		bind:tableHead
		bind:tableData
		buttonPart={{ haveButton: true, buttonText: 'update key', ButtonFunction }}
	></LeleDataTable>
</div>

<div class="flex h-fit w-screen flex-wrap gap-4 p-4">
	<div class="h-fit w-fit rounded-lg border-4 border-blue-700 p-3 text-5xl">
		<a href="/lele/importCsv">import csv</a>
	</div>
</div>
