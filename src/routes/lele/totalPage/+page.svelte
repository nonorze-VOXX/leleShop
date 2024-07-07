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
		artist_name: string;
		net_total: number;
	}[] = [];

	let realTotal: number[] = [];
	let totalData90: number[] = [];

	let sumTotalData: {
		real_sales_sum: number;
		real_sales_90_sum: number;
	};
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
		realTotal = [];
		totalData90 = [];
		totalData = result;
		result.map((data) => {
			realTotal.push(data.net_total);
			totalData90.push(Math.ceil(data.net_total * 0.9));
		});
		sumTotalData = {
			real_sales_sum: realTotal.reduce((a, b) => a + b, 0),
			real_sales_90_sum: totalData90.reduce((a, b) => a + b, 0)
		};
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

{#if showedMonth}
	<MonthTab
		bind:tabDataList
		bind:showedMonth
		on:onTabChange={async (e) => {
			await ClickTab(e.detail.showedMonth);
		}}
	></MonthTab>
{/if}
<LeleTable>
	<LeleThead>
		<tr>
			<th scope="col" class="w-auto p-2">name</th>
			<th scope="col" class="w-20 p-2">Total</th>
			<th scope="col" class="w-20 p-2">90%</th>
		</tr>
	</LeleThead>
	<LeleTbody>
		{#if sumTotalData}
			<LeleTbodyTr>
				<td class="p-2"> TOTAL</td>
				<td class="p-2">{sumTotalData.real_sales_sum}</td>
				<td class="p-2">{sumTotalData.real_sales_90_sum}</td>
			</LeleTbodyTr>
		{/if}
		{#each totalData as data, index}
			<LeleTbodyTr>
				<td class="p-2">{data.artist_name}</td>
				<td class="p-2">{realTotal[index]}</td>
				<td class="p-2">
					{totalData90[index]}
				</td>
			</LeleTbodyTr>
		{/each}
	</LeleTbody>
</LeleTable>
