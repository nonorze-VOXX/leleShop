<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	const title = ['日期', '收據號碼', '商品', '數量', '銷售總額', '折扣', '淨銷售額'];
	let artist_name: string = '';
	let total = 0;
	let net_total = -1;
	let discount_total = 0;
	let commission = 0;
	let total_quantity = 0;
	export let data: PageData;
	onMount(() => {
		artist_name = data.artist_name as string;
		total = 0;
		net_total = 0;
		discount_total = 0;
		total_quantity = 0;
		data.data.forEach((element) => {
			total += element.total_sales ? element.total_sales : 0;
			net_total += element.net_sales ? element.net_sales : 0;
			discount_total += element.discount ? element.discount : 0;
			total_quantity += element.quantity ? element.quantity : 0;
		});
		commission = net_total >= 2000 ? Math.floor(net_total * 0.1) : 0;
	});
	const noCommisionText = '這個月優惠，不抽成喔';
</script>

<div class="flex flex-col p-5 gap-3 items-center">
	<h1 class="text-center p-5 text-3xl font-bold">{artist_name}</h1>
	{#if net_total != -1}
		{#if net_total >= 2000}
			<div>
				<p class="inline">抽成10%:</p>
				{commission}
			</div>
		{:else}
			<div class="text-xl font-medium">
				<p class="inline">抽成10%:</p>
				{noCommisionText}
			</div>
		{/if}
	{/if}
	{#if data}
		<div class="flex justify-center">
			<div class="border-red-900 border-2 rounded-lg overflow-hidden">
				<table class="min-w-fit text-left text-base font-medium table-auto">
					<thead class="border-b dark:border-neutral-500">
						{#each title as head}
							<td class="py-2 px-4 font-semibold text-xl">{head}</td>
						{/each}
					</thead>

					<tbody>
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
						{#each data.data as trade}
							<tr
								class=" border-b transition duration-300 ease-in-out hover:bg-neutral-100 dark:border-neutral-500 dark:hover:bg-neutral-300"
							>
								<td class="py-2 px-4">
									<p>
										{trade.trade_head?.trade_date?.split('+')[0].split('T')[0]}
									</p>
									<p>
										{trade.trade_head?.trade_date?.split('+')[0].split('T')[1]}
									</p>
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
</div>
