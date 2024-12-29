<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { GetTotalWithRemit, GetTradeTotalDataEachOne } from './totalPage';
	import { GetAllMonth, ThisMonthFirstDate } from '$lib/function/Utils';
	import YearMonthTabs from '$lib/Component/YearMonthTabs.svelte';
	import { selectedStore } from '$lib/store/choosing';
	import { browser } from '$app/environment';
	import db, { type StoreRow } from '$lib/db';
	import { YearMonth } from '$lib/class/YearMonth';
	import TotalTable from './TotalTable.svelte';

	let totalData: {
		artist_name: string | null;
		total_sales: number;
		net_sales: number;
		discount: number;
	}[] = [];

	let realTotal: number[] = [];
	let dataReady = false;

	let yearRange = { min: new Date().getFullYear(), max: new Date().getFullYear() }; // Adjust min year as needed
	let RemitDataMulNetTotal: {
		netSaleMulRemit: number;
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
		dataReady = false;
		const { data, error } = await GetTradeTotalDataEachOne(
			yearMonth.getFirstTimePoint(),
			yearMonth.getLastTimePoint(),
			$selectedStore
		);
		if (error) {
			console.error(error);
			return;
		}
		totalData = data ?? [];
		realTotal = [];
		totalData.map((data) => {
			realTotal.push(data.net_sales);
		});
		if ($selectedStore !== '*') {
			const remitPromises = $selectedStore.map((store) => GetTotalWithRemit(yearMonth, store));
			const remitResults = await Promise.all(remitPromises);
			const flat = remitResults.flatMap((commission, index) =>
				commission.map((e) => ({
					...e,
					store_name: $selectedStore[index]
				}))
			);
			RemitDataMulNetTotal = flat;
		}
		dataReady = true;
	};

	let yearMonth = new YearMonth(
		ThisMonthFirstDate(-1).getFullYear(),
		ThisMonthFirstDate(-1).getMonth() + 1
	);
	let tabDataList: string[] = GetAllMonth();
	const ClickTab = async (tabData: string) => {
		yearMonth.month = parseInt(tabData);
		await FetchData(yearMonth);
	};

	const ClickYearTab = async (tabData: string) => {
		yearMonth.year = parseInt(tabData);
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
		db.GetTradeDataMinYear().then(({ data, error }) => {
			if (!error) yearRange.min = data;
		});

		await FetchData(yearMonth);
	});
	onDestroy(
		selectedStore.subscribe(async () => {
			if (browser) await FetchData(yearMonth);
		})
	);
</script>

{#if yearMonth}
	<YearMonthTabs
		bind:tabDataList
		bind:yearMonth
		{yearRange}
		on:onTabChange={async (e) => {
			await ClickTab(e.detail.showedMonth);
		}}
		on:onYearTabChange={async (e) => {
			await ClickYearTab(e.detail.showedYear);
		}}
	></YearMonthTabs>
{/if}
{#if RemitDataMulNetTotal}
	<TotalTable
		bind:totalData
		bind:realTotal
		bind:RemitDataMulNetTotal
		bind:storeData
		{dataReady}
		selectedStore={$selectedStore}
	></TotalTable>
{/if}
