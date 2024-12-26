<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
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
	import YearMonthTabs from '$lib/Component/YearMonthTabs.svelte';
	import { selectedStore } from '$lib/store/choosing';
	import { browser } from '$app/environment';

	let totalData: {
		artist_name: string | null;
		total_sales: number;
		net_sales: number;
		discount: number;
	}[] = [];

	let realTotal: number[] = [];
	let totalData90: number[] = [];

	let sumTotalData: {
		real_sales_sum: number;
		real_sales_90_sum: number;
	};
	let showedMonth: string;
	let showedYear: string = new Date().getFullYear().toString();
	let yearRange = { min: 2020, max: new Date().getFullYear() }; // Adjust min year as needed

	const FetchData = async (dateRange: { firstDate: Date; lastDate: Date }) => {
		const { data, error } = await GetTradeTotalDataEachOne(
			dateRange.firstDate,
			dateRange.lastDate,
			$selectedStore
		);
		showedMonth = FormatNumberToTwoDigi((dateRange.firstDate.getMonth() + 1).toString());
		if (error) {
			console.error(error);
			return;
		}
		totalData = data ?? [];
		realTotal = [];
		totalData90 = [];
		totalData.map((data) => {
			realTotal.push(data.total_sales - data.discount);
			totalData90.push(Math.ceil(data.net_sales * 0.9));
		});
		sumTotalData = {
			real_sales_sum: realTotal.reduce((a, b) => a + b, 0),
			real_sales_90_sum: totalData90.reduce((a, b) => a + b, 0)
		};
	};

	let dateRange = { firstDate: ThisMonthFirstDate(-1), lastDate: NextMonthFirstDate(-1) };
	let tabDataList: string[] = GetAllMonth();
	const ClickTab = async (tabData: string) => {
		showedMonth = tabData;
		let firstDay = new Date(parseInt(showedYear), parseInt(tabData) - 1, 1);
		let lastDay = new Date(parseInt(showedYear), parseInt(tabData), 1);
		dateRange = { firstDate: firstDay, lastDate: lastDay };
		await FetchData(dateRange);
	};

	const ClickYearTab = async (tabData: string) => {
		showedYear = tabData;
		let firstDay = new Date(parseInt(tabData), parseInt(showedMonth) - 1, 1);
		let lastDay = new Date(parseInt(tabData), parseInt(showedMonth), 1);
		dateRange = { firstDate: firstDay, lastDate: lastDay };
		await FetchData(dateRange);
	};

	// onMount
	onDestroy(
		selectedStore.subscribe(async () => {
			if (browser) await FetchData(dateRange);
		})
	);
</script>

{#if showedMonth}
	<YearMonthTabs
		bind:tabDataList
		bind:showedMonth
		bind:showedYear
		{yearRange}
		on:onTabChange={async (e) => {
			await ClickTab(e.detail.showedMonth);
		}}
		on:onYearTabChange={async (e) => {
			await ClickYearTab(e.detail.showedYear);
		}}
	></YearMonthTabs>
{/if}
<LeleTable>
	<LeleThead>
		<tr>
			<th scope="col" class="w-auto p-2">name</th>
			<th scope="col" class="w-20 p-2">Total</th>
			<th scope="col" class="w-30 p-2">commission</th>
		</tr>
	</LeleThead>
	<LeleTbody>
		{#if sumTotalData}
			<LeleTbodyTr>
				<td class="p-2"> TOTAL</td>
				<td class="p-2">{sumTotalData.real_sales_sum}</td>
				<td class="p-2">{sumTotalData.real_sales_90_sum} ({'a'})</td>
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
