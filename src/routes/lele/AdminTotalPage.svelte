<script lang="ts">
	import { onMount } from 'svelte';
	import LeleTable from '$lib/Component/htmlWrapper/LeleTable.svelte';
	import LeleThead from '$lib/Component/htmlWrapper/LeleThead.svelte';
	import LeleTbody from '$lib/Component/htmlWrapper/LeleTbody.svelte';
	import { GetTradeTotalDataEachOne } from './totalPage';
	import { NextMonthFirstDate, ThisMonthFirstDate } from '$lib/function/Utils';
	import LeleTbodyTr from '$lib/Component/htmlWrapper/LeleTbodyTr.svelte';

	let totalData: {
		name: string;
		total_sales_sum: number;
		net_sales_sum: number;
		discount_sum: number;
	}[] = [];
	onMount(async () => {
		const { result, error } = await GetTradeTotalDataEachOne(
			ThisMonthFirstDate(),
			NextMonthFirstDate()
		);
		if (error) {
			console.error(error);
			return;
		}
		totalData = result;
	});
</script>

<div>month:{ThisMonthFirstDate().getMonth()}</div>
<LeleTable>
	<LeleThead>
		<tr>
			<th scope="col" class="w-auto p-2">name</th>
			<th scope="col" class="w-20 p-2">Total</th>
		</tr>
	</LeleThead>
	<LeleTbody>
		{#each totalData as data}
			<LeleTbodyTr>
				<td class="p-2">{data.name}</td>
				<td class="p-2">{data.total_sales_sum - data.discount_sum}</td>
			</LeleTbodyTr>
		{/each}
	</LeleTbody>
</LeleTable>
