<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	const title = ['日期', '收據號碼', '商品', '數量', '銷售總額', '折扣', '淨銷售額'];
	let artist_name: string = '';
	export let data: PageData;
	onMount(() => {
		if (data.data.length > 0) {
			artist_name = data.data.at(0)?.artist_name as string;
		}
	});
</script>

<h1 class="text-center p-5 text-3xl font-bold">{artist_name}</h1>
{#if data}
	<div class="flex justify-center px-10">
		<div class="border-red-900 border-2 rounded-lg overflow-hidden">
			<table class="min-w-fit text-left text-base font-medium table-auto">
				<thead class="border-b dark:border-neutral-500">
					{#each title as head}
						<td class="py-2 px-4 font-semibold text-xl">{head}</td>
					{/each}
				</thead>

				<tbody>
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
