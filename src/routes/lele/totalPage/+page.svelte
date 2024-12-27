<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import LeleTable from '$lib/Component/htmlWrapper/LeleTable.svelte';
	import LeleThead from '$lib/Component/htmlWrapper/LeleThead.svelte';
	import LeleTbody from '$lib/Component/htmlWrapper/LeleTbody.svelte';
	import { GetCommission, GetTotalWithCommission, GetTradeTotalDataEachOne } from './totalPage';
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
	import db, { type StoreRow } from '$lib/db';
	import type { CommissionViewRow } from '$lib/db/DbCommission';

	let totalData: {
		artist_name: string | null;
		total_sales: number;
		net_sales: number;
		discount: number;
	}[] = [];

	let realTotal: number[] = [];
	let commissionData: CommissionViewRow[] = [];

	let showedMonth: string;
	let showedYear: string = new Date().getFullYear().toString();
	let yearRange = { min: 2020, max: new Date().getFullYear() }; // Adjust min year as needed
	let testCommissionData: {
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
		totalData.map((data) => {
			realTotal.push(data.net_sales);
		});
		let year_month = dateRange.firstDate.getFullYear() + '-' + showedMonth;
		for (let i = 0; i < $selectedStore.length; i++) {
			let commission = await GetTotalWithCommission(year_month, $selectedStore[i]);
			testCommissionData = [
				...commission.map((e) => {
					return {
						...e,
						store_name: $selectedStore[i]
					};
				}),
				...testCommissionData
			];
		}

		// sumTotalData = {
		// 	real_sales_sum: realTotal.reduce((a, b) => a + b, 0)
		// };
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

	let storeData: StoreRow[] = [];

	onMount(async () => {
		await db.store.getStoreData().then(({ data, error }) => {
			if (error) {
				console.error(error);
				return;
			}
			storeData = data ?? [];
		});
	});
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
			<th scope="col" class="w-60 p-2">name</th>
			<th scope="col" class="w-20 p-2">Net Total</th>
			{#each $selectedStore as store}
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
				{#each $selectedStore as store}
					<td class="p-2">
						{#if testCommissionData.find((item) => item.artist_name === data.artist_name && item.store_name === store)}
							{testCommissionData.find(
								(item) => item.artist_name === data.artist_name && item.store_name === store
							)?.processedNetSale}({testCommissionData.find(
								(item) => item.artist_name === data.artist_name && item.store_name === store
							)?.commission}%)
						{/if}
					</td>
				{/each}
				<td class="p-2">
					{#if $selectedStore === '*'}
						{storeData.reduce((acc, store) => {
							return (
								acc +
								(testCommissionData.find(
									(item) =>
										item.artist_name === data.artist_name && item.store_name === store.store_name
								)?.processedNetSale ?? 0)
							);
						}, 0)}
					{:else}
						{$selectedStore.reduce((acc, store) => {
							return (
								acc +
								(testCommissionData.find(
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
