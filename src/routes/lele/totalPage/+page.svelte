<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { GetTotalWithRemit, GetTradeTotalDataEachOne } from './totalPage';
	import { GetAllMonth, ThisMonthFirstDate } from '$lib/function/Utils';
	import YearMonthTabs from '$lib/Component/reportComponent/YearMonthTabs.svelte';
	import { selectedStore, type StoreList } from '$lib/store/choosing';
	import { browser } from '$app/environment';
	import db, { type StoreRow } from '$lib/db';
	import { YearMonth } from '$lib/class/YearMonth';
	import TotalTable from './TotalTable.svelte';

	let totalData: {
		artist_name: string | null;
		total_sales: number;
		net_sales: number;
		discount: number;
	}[] = $state([]);

	let realTotal: number[] = $state([]);
	let dataReady = $state(false);

	let yearRange = $state({ min: new Date().getFullYear(), max: new Date().getFullYear() }); // Adjust min year as needed
	let RemitDataMulNetTotal = $state<
		{
			netSaleMulRemit: number;
			total_sales: number;
			net_sales: number;
			discount: number;
			quantity: number;
			artist_id: number | null;
			artist_name: string | null;
			store_name: string;
			commission: number;
		}[]
	>([]);
	// const yearMonth = $state(
	// 	new YearMonth(ThisMonthFirstDate(-1).getFullYear(), ThisMonthFirstDate(-1).getMonth() + 1)
	// );
	// const CreateFetchWithYearMonth = (yearMonth: YearMonth) => {
	// 	return () => {
	// 		return FetchData(yearMonth);
	// 	};
	// };
	const GetInitYearMonth = () => {
		return new YearMonth(
			ThisMonthFirstDate(-1).getFullYear(),
			ThisMonthFirstDate(-1).getMonth() + 1
		);
	};
	let nowYearMonth = GetInitYearMonth();
	// let FetchFunctionByLatestYearMonth = CreateFetchWithYearMonth(yearMonth);

	const FetchDataDeep = async (yearMonth: YearMonth, storeList: StoreList) => {
		dataReady = false;
		const { data, error } = await GetTradeTotalDataEachOne(
			yearMonth.getFirstTimePoint(),
			yearMonth.getLastTimePoint(),
			storeList
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
		if (storeList !== '*') {
			const remitPromises = storeList.map((store) => GetTotalWithRemit(yearMonth, store));
			const remitResults = await Promise.all(remitPromises);
			const flat = remitResults.flatMap((commission, index) =>
				commission.map((e) => ({
					...e,
					store_name: storeList[index]
				}))
			);
			RemitDataMulNetTotal = flat;
		}
		dataReady = true;
	};
	const FetchData = async (yearMonth: YearMonth) => {
		return await FetchDataDeep(yearMonth, $selectedStore);
	};

	let tabDataList: string[] = $state(GetAllMonth());

	let storeData: StoreRow[] = $state([]);

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

		await FetchData(nowYearMonth);
	});
	onDestroy(
		selectedStore.subscribe(async () => {
			if (browser) await FetchData(nowYearMonth);
		})
	);
</script>

<YearMonthTabs
	{tabDataList}
	initYearMonth={GetInitYearMonth()}
	{yearRange}
	yearMonthChange={async (yearMonth) => {
		// FetchFunctionByLatestYearMonth = CreateFetchWithYearMonth(yearMonth);
		nowYearMonth = yearMonth;
		await FetchData(yearMonth);
	}}
></YearMonthTabs>
{#if RemitDataMulNetTotal}
	<TotalTable
		{totalData}
		{realTotal}
		{RemitDataMulNetTotal}
		{storeData}
		{dataReady}
		selectedStore={$selectedStore}
	></TotalTable>
{/if}
