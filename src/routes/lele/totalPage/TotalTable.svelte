<script lang="ts">
	import LeleTable from '$lib/Component/htmlWrapper/LeleTable.svelte';
	import LeleThead from '$lib/Component/htmlWrapper/LeleThead.svelte';
	import LeleTbody from '$lib/Component/htmlWrapper/LeleTbody.svelte';
	import LeleTbodyTr from '$lib/Component/htmlWrapper/LeleTbodyTr.svelte';
	import { type StoreRow } from '$lib/db';

	export let totalData: {
		artist_name: string | null;
		total_sales: number;
		net_sales: number;
		discount: number;
	}[] = [];

	export let realTotal: number[] = [];
	export let CommissionDataMulNetTotal: {
		processedNetSale: number;
		total_sales: number;
		net_sales: number;
		discount: number;
		quantity: number;
		artist_id: number | null;
		artist_name: string | null;
		store_name: string;
		commission: number;
	}[] = [];

	export let storeData: StoreRow[] = [];
	export let selectedStore: string[] | '*';
</script>

<LeleTable>
	<LeleThead>
		<tr>
			<th scope="col" class="w-60 p-2">name</th>
			<th scope="col" class="w-20 p-2">Net Total</th>
			{#each selectedStore as store}
				<th scope="col" class="w-20 p-2">{store}</th>
			{/each}
			<th scope="col" class="w-20 p-2">store sum</th>
		</tr>
	</LeleThead>
	<LeleTbody>
		{#each totalData as data, index}
			<LeleTbodyTr>
				<td class="p-2">{data.artist_name}</td>
				<td class="p-2">{realTotal[index]}</td>
				{#each selectedStore as store}
					<td class="p-2">
						{#if CommissionDataMulNetTotal.find((item) => item.artist_name === data.artist_name && item.store_name === store)}
							{CommissionDataMulNetTotal.find(
								(item) => item.artist_name === data.artist_name && item.store_name === store
							)?.processedNetSale}({CommissionDataMulNetTotal.find(
								(item) => item.artist_name === data.artist_name && item.store_name === store
							)?.commission}%)
						{/if}
					</td>
				{/each}
				<td class="p-2">
					{#if selectedStore === '*'}
						{storeData.reduce((acc, store) => {
							return (
								acc +
								(CommissionDataMulNetTotal.find(
									(item) =>
										item.artist_name === data.artist_name && item.store_name === store.store_name
								)?.processedNetSale ?? 0)
							);
						}, 0)}
					{:else}
						{selectedStore.reduce((acc, store) => {
							return (
								acc +
								(CommissionDataMulNetTotal.find(
									(item) => item.artist_name === data.artist_name && item.store_name === store
								)?.processedNetSale ?? 0)
							);
						}, 0)}
					{/if}
				</td>
			</LeleTbodyTr>
		{/each}
	</LeleTbody>
</LeleTable>
