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
	import { YearMonth } from '$lib/class/YearMonth';

	let totalData: {
		artist_name: string | null;
		total_sales: number;
		net_sales: number;
		discount: number;
	}[] = [];

	let realTotal: number[] = [];

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

	const FetchData = async (yearMonth: YearMonth) => {
		const { data, error } = await GetTradeTotalDataEachOne(
			yearMonth.getFirstTimePoint(),
			yearMonth.getLastTimePoint(),
			$selectedStore
		);
		showedMonth = FormatNumberToTwoDigi(yearMonth.month.toString());
		if (error) {
			console.error(error);
			return;
		}
		totalData = data ?? [];
		realTotal = [];
		totalData.map((data) => {
			realTotal.push(data.net_sales);
		});
		for (let i = 0; i < $selectedStore.length; i++) {
			let commission = await GetTotalWithCommission(yearMonth, $selectedStore[i]);
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
	};

	let yearMonth = new YearMonth(
		ThisMonthFirstDate(-1).getFullYear(),
		ThisMonthFirstDate(-1).getDate()
	);
	let tabDataList: string[] = GetAllMonth();
	const ClickTab = async (tabData: string) => {
		showedMonth = tabData;
		yearMonth = new YearMonth(showedYear, showedMonth);
		await FetchData(yearMonth);
	};

	const ClickYearTab = async (tabData: string) => {
		showedYear = tabData;
		yearMonth = new YearMonth(showedYear, showedMonth);
		await FetchData(yearMonth);
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
		await FetchData(yearMonth);
	});
	onDestroy(
		selectedStore.subscribe(async () => {
			if (browser) await FetchData(yearMonth);
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
