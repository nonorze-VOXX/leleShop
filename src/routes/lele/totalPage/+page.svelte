<script lang="ts">
	import { onMount } from 'svelte';
	import LeleTable from '$lib/Component/htmlWrapper/LeleTable.svelte';
	import LeleThead from '$lib/Component/htmlWrapper/LeleThead.svelte';
	import LeleTbody from '$lib/Component/htmlWrapper/LeleTbody.svelte';
	import { GetTradeTotalDataEachOne } from './totalPage';
	import {
		FormatNumberToTwoDigi,
		GetAllMonth,
		NextMonthFirstDate,
		ThisMonthFirstDate
	} from '$lib/function/Utils';
	import LeleTbodyTr from '$lib/Component/htmlWrapper/LeleTbodyTr.svelte';
	import MonthTab from '$lib/Component/MonthTab.svelte';

	let totalData: {
		name: string;
		total_sales_sum: number;
		net_sales_sum: number;
		discount_sum: number;
	}[] = [];
	onMount(async () => {
		await FetchData(ThisMonthFirstDate(-1), NextMonthFirstDate(-1));
	});
	let showedMonth: string;
	const FetchData = async (firstDate: Date, lastDate: Date) => {
		const { result, error } = await GetTradeTotalDataEachOne(firstDate, lastDate);
		showedMonth = FormatNumberToTwoDigi((firstDate.getMonth() + 1).toString());
		if (error) {
			console.error(error);
			return;
		}
		totalData = result;
	};

	let tabDataList: string[] = GetAllMonth();
	const ClickTab = async (tabData: string) => {
		showedMonth = tabData;
		const date = new Date();
		let firstDay = new Date(date.getFullYear(), parseInt(tabData) - 1, 1);
		let lastDay = new Date(date.getFullYear(), parseInt(tabData), 1);
		await FetchData(firstDay, lastDay);
	};
</script>

<MonthTab
	bind:tabDataList
	bind:showedMonth
	on:onTabChange={async (e) => {
		await ClickTab(e.detail.showedMonth);
	}}
></MonthTab>
<LeleTable>
	<LeleThead>
		<tr>
			<th scope="col" class="w-auto p-2">name</th>
			<th scope="col" class="w-20 p-2">Total</th>
			<th scope="col" class="w-20 p-2">90%</th>
		</tr>
	</LeleThead>
	<LeleTbody>
		{#each totalData as data}
			<LeleTbodyTr>
				<td class="p-2">{data.name}</td>
				<td class="p-2">{data.total_sales_sum - data.discount_sum}</td>
				<td class="p-2"
					>{data.total_sales_sum -
						data.discount_sum -
						Math.floor((data.total_sales_sum - data.discount_sum) * 0.1)}</td
				>
			</LeleTbodyTr>
		{/each}
	</LeleTbody>
</LeleTable>
