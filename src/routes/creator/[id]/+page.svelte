<script lang="ts">
	import DownloadButton from './DownloadButton.svelte';
	import PasswordPanel from './PasswordPanel.svelte';
	import { onDestroy, onMount } from 'svelte';
	import db, { supabase, type ArtistWithTradeRow, type SalesTotalData } from '$lib/db';
	import { page } from '$app/state';
	import TradeCount from '$lib/Component/reportComponent/TradeCount.svelte';
	import InfoBox from '$lib/Component/InfoBox.svelte';
	import { selectedStore, type StoreList } from '$lib/store/choosing';
	import { FormatNumberToTwoDigi, GetAllMonth, ThisMonthFirstDate } from '$lib/function/Utils';
	import RemitAndCommission from '$lib/Component/reportComponent/RemitAndCommission.svelte';
	import { PasswordPanelState } from './PanelState';
	import { YearMonth } from '$lib/class/YearMonth';
	import YearMonthTabs from '$lib/Component/reportComponent/YearMonthTabs.svelte';
	import ReportTable from '$lib/Component/reportComponent/ReportTable.svelte';
	import { GetFilteredTradeData, GetPageData, GetTotal } from '$lib/function/query';
	import type { DateRange } from '$lib/type';

	let artist_name: string = $state('');
	let artist_id: number = $state(Number(page.params.id));
	let panelState: PasswordPanelState = $state(PasswordPanelState.Loading);
	let showedLength = $state(0);
	let logText: string = $state('');

	let firstDate: Date | null = $state(null);
	let lastDate: Date | null = $state(null);
	let yearRange: { min: number; max: number } = $state({ min: 0, max: 0 });
	let year_month: string | null = $state(null);
	let total: SalesTotalData = $state({
		sales_total: 0,
		net_total: 0,
		discount_total: 0,
		total_quantity: 0
	});
	let filterText: string = $state('');
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
	let queryedTradeDataList: ArtistWithTradeRow[] = $state([]);
	let filteredTradeDataList: ArtistWithTradeRow[] = $state([]);
	onMount(async () => {
		panelState = PasswordPanelState.NotAdmit;
		const artist_data = (await db.artist.GetArtistData(artist_id)).data ?? [];
		console.log(artist_data);
		artist_name = artist_data.length !== 0 ? artist_data[0].artist_name : 'not found this artist';
		const { data, error } = await db.GetTradeDataMinYear();
		if (error) {
			console.error(error);
			return;
		}
		yearRange = { min: data, max: new Date().getFullYear() };
		let initYM = YearMonth.now().getPreviousMonth();
		year_month = initYM.year + '-' + FormatNumberToTwoDigi(initYM.month.toString());
	}); // use selectedStore will init
	onDestroy(() => {
		selectedStore.subscribe(async (e) => {
			queryParam.storeList = $selectedStore;
		})();
	});
	const GetTradeData = async () => {
		await GetPageData(queryParam).then((data) => {
			queryedTradeDataList = data.tradeData;

			filteredTradeDataList = GetFilteredTradeData(filterText, queryedTradeDataList);
			showedLength = filteredTradeDataList.length;
			total = GetTotal(filteredTradeDataList);
		});
	};
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
	<div>{logText}</div>

	{#if panelState === PasswordPanelState.Loading}
		<div class="flex h-screen items-center justify-center">
			<div class="h-32 w-32 animate-spin rounded-full border-b-2 border-l-2 border-lele-line"></div>
		</div>
	{:else if panelState === PasswordPanelState.NotAdmit}
		<div class="flex flex-wrap gap-2 text-2xl font-bold">
			<InfoBox title={artist_name}></InfoBox>
		</div>
		<PasswordPanel
			{artist_id}
			onSuccessLogin={() => {
				panelState = PasswordPanelState.Admit;
			}}
		></PasswordPanel>
	{:else if panelState === PasswordPanelState.Admit}
		<div class="flex flex-wrap justify-center gap-4 text-center text-sm font-semibold">
			<InfoBox title={artist_name}></InfoBox>
			<TradeCount {showedLength}></TradeCount>
			{#if year_month}
				<RemitAndCommission net_total={total.net_total} {artist_id} {year_month}
				></RemitAndCommission>
			{/if}

			<DownloadButton {firstDate} {lastDate} {artist_id}></DownloadButton>
		</div>
		<div class="flex flex-wrap gap-2 text-lg font-bold">
			<h2>filter</h2>
			<input
				class="w-60 rounded-md border-4 border-lele-line px-1 sm:w-80"
				type="text"
				bind:value={filterText}
				onchange={() => {
					filteredTradeDataList = GetFilteredTradeData(filterText, queryedTradeDataList);
					showedLength = filteredTradeDataList.length;
					total = GetTotal(filteredTradeDataList);
				}}
			/>
		</div>
		<div class="flex w-full flex-col">
			<YearMonthTabs
				tabDataList={GetAllMonth()}
				initYearMonth={YearMonth.now().getPreviousMonth()}
				{yearRange}
				{yearMonthChange}
			></YearMonthTabs>
			<ReportTable showedTradeDataList={filteredTradeDataList} totalData={total}></ReportTable>
		</div>
	{/if}
</div>
