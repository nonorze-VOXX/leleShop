<script lang="ts">
	import { page } from '$app/state';
	import { YearMonth } from '$lib/class/YearMonth';
	import InfoBox from '$lib/Component/InfoBox.svelte';
	import RemitAndCommission from '$lib/Component/reportComponent/RemitAndCommission.svelte';
	import ReportTable from '$lib/Component/reportComponent/ReportTable.svelte';
	import TradeCount from '$lib/Component/reportComponent/TradeCount.svelte';
	import YearMonthTabs from '$lib/Component/reportComponent/YearMonthTabs.svelte';
	import db, { type ArtistWithTradeRow, type SalesTotalData } from '$lib/db';
	import { FormatNumberToTwoDigi, ThisMonthFirstDate } from '$lib/function/Utils';
	import { selectedStore, type StoreList } from '$lib/store/choosing';
	import type { DateRange } from '$lib/type';

	import { onDestroy, onMount } from 'svelte';
	import { GetPageData } from './page';
	const artist_id: number = $state(Number(page.params.creator_id));
	let artist_name: string = $state('');
	let yearRange: { min: number; max: number } = $state({ min: 0, max: 0 });
	let queryParam: {
		artist_id: number;
		storeList: StoreList;
		dateRange: DateRange;
		page: number;
	} = {
		artist_id: artist_id,
		storeList: '*',
		dateRange: {
			firstDate: ThisMonthFirstDate(-1),
			lastDate: ThisMonthFirstDate()
		},
		page: 0
	};
	let showedLength = $state(0);
	let showedTradeDataList: ArtistWithTradeRow[] = $state([]);

	onMount(async () => {
		const artist_data = (await db.artist.GetArtistData(artist_id)).data ?? [];
		artist_name = artist_data.length !== 0 ? artist_data[0].artist_name : 'not found this artist';
		const { data, error } = await db.GetTradeDataMinYear();
		if (error) {
			console.error(error);
			return;
		}
		yearRange = { min: data, max: new Date().getFullYear() };
		console.log($state.snapshot(yearRange));
	});

	onDestroy(() => {
		selectedStore.subscribe(async (e) => {
			queryParam.storeList = $selectedStore;
		})();
	});
	const GetTradeData = async () => {
		await GetPageData(queryParam).then((data) => {
			showedTradeDataList = data.tradeData;
			showedLength = data.count;
			total = data.total;
		});
	};
	const pageChange = (page: number) => {
		queryParam.page = page;
	};
	let year_month: string | null = $state(null);

	let total: SalesTotalData = $state({
		sales_total: 0,
		net_total: 0,
		discount_total: 0,
		total_quantity: 0
	});
	const yearMonthChange = async (yearMonth: YearMonth) => {
		queryParam.dateRange = {
			firstDate: yearMonth.getFirstTimePoint(),
			lastDate: yearMonth.getLastTimePoint()
		};
		queryParam.page = 0;
		year_month =
			yearMonth.getFirstTimePoint()?.getFullYear().toString() +
			'-' +
			FormatNumberToTwoDigi((yearMonth.getFirstTimePoint()?.getMonth() + 1).toString());
		await GetTradeData();
	};
</script>

<div class="flex flex-col items-center gap-3">
	<div class="flex flex-wrap justify-center gap-4 text-center text-sm font-semibold">
		<InfoBox title={artist_name}></InfoBox>
		<TradeCount {showedLength}></TradeCount>
		{#if year_month}
			<RemitAndCommission net_total={total.net_total} {artist_id} {year_month} />
		{/if}
	</div>
	<div class="flex w-full flex-col">
		<YearMonthTabs
			tabDataList={['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']}
			initYearMonth={YearMonth.now().getPreviousMonth()}
			{yearRange}
			{yearMonthChange}
		></YearMonthTabs>
		<ReportTable {showedTradeDataList} totalData={total}></ReportTable>

		<!-- <PageTab count={showedLength} {pageChange}></PageTab> -->
	</div>
</div>
