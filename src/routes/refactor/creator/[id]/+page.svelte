<script lang="ts">
	import type { PageData } from './$types';

	const title = [
		'日期',
		'收據號碼',
		'類別',
		'商品',
		'數量',
		'銷售總額',
		'折扣',
		'淨銷售額',
		'狀態'
	];
	export let data: PageData;
</script>

{#if data}
	<div class="flex justify-center p-10">
		<div class="border-red-900 border-2 rounded-lg overflow-hidden">
			<table class="min-w-fit text-left text-base font-medium table-auto">
				<thead class="border-b dark:border-neutral-500">
					{#each title as head}
						<td class="py-2 px-4">{head}</td>
					{/each}
				</thead>

				<tbody>
					{#each data.data as trade}
						<tr
							class=" border-b transition duration-300 ease-in-out hover:bg-neutral-100 dark:border-neutral-500 dark:hover:bg-neutral-300"
						>
							<td class="py-2 px-4"> {trade.trade_head.trade_date}</td>
							<td class="py-2 px-4"> {trade.trade_id}</td>
							<td class="py-2 px-4"> {trade.artist_name}</td>
							<td class="py-2 px-4"> {trade.item_name}</td>
							<td class="py-2 px-4"> {trade.quantity}</td>
							<td class="py-2 px-4"> {trade.total_sales}</td>
							<td class="py-2 px-4"> {trade.discount}</td>
							<td class="py-2 px-4"> {trade.net_sales}</td>
							<td class="py-2 px-4"> {trade.trade_head.state}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{/if}
