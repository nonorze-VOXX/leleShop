<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { TradeBodyRow, TradeHeadRow } from '$lib/db';
	import {
		GetDateRange,
		GetNewArtistList,
		GetStoreData,
		fileToArray,
		savePartToDb,
		tradeIdIndex
	} from './importFunction';
	import { groupBy } from '$lib/function/Utils';
	import db from '$lib/db';
	enum ProcessedStatus {
		NORMAL,
		PROCESSING,
		ERROR,
		PROCESSED
	}
	const timeZoneOffsetToHHMM = (timeZoneOffset: number) => {
		const sign = timeZoneOffset < 0 ? '+' : '-';
		const abs = Math.abs(timeZoneOffset);
		const hour = Math.floor(abs / 60);
		const minute = abs % 60;
		return sign + (hour < 10 ? '0' : '') + hour + ':' + (minute < 10 ? '0' : '') + minute;
	};

	let newTradeHeadList: TradeHeadRow[] = [];
	let newTradeBodyList: TradeBodyRow[] = [];
	let susTrade: string[] = [];
	let processed: ProcessedStatus = ProcessedStatus.NORMAL;
	let submitLog: string = '';
	async function handleSubmit(event: { currentTarget: EventTarget & HTMLFormElement }) {
		const data = new FormData(event.currentTarget);
		processed = ProcessedStatus.PROCESSING;
		const { error, newTradeBody, newTradeHead, susTradeIdLists } = await f(
			data,
			timeZoneOffsetToHHMM(new Date().getTimezoneOffset())
		);

		if (!error) {
			// submitLog = result.data?.error;
			newTradeBodyList = newTradeBody ?? [];
			newTradeHeadList = newTradeHead ?? [];
			susTrade = susTradeIdLists ?? [];
			processed = ProcessedStatus.PROCESSED;
			await invalidateAll();
		} else {
			processed = ProcessedStatus.ERROR;
			submitLog = error.toString();
			console.error(error);
		}
	}
	const f = async (formData: FormData, timezoneOffset: string) => {
		const files = formData.getAll('fileToUpload');
		if (files.length === 0) {
			return { error: 'You must provide a file to upload' };
		}
		let susTradeIdLists: string[] = [];

		for (let i = 0; i < files.length; i++) {
			const file = files[i] as File;
			const fileArr2D = await fileToArray(file);
			let dataHeader: string[] = [];
			dataHeader = fileArr2D[0];
			if (!dataHeader) {
				continue;
			}

			const groupByOrder = groupBy(fileArr2D.slice(1), (i) => i[tradeIdIndex(dataHeader)]);
			const { maxDate, minDate } = await GetDateRange(groupByOrder, dataHeader, timezoneOffset);

			const tradeIdList =
				(await db.GetTradeIdList({ firstDate: minDate, lastDate: maxDate })).data ?? [];
			let artistList = (await db.GetArtistDataList()).data ?? [];
			const newArtistList = GetNewArtistList(artistList, groupByOrder, dataHeader);
			{
				if (newArtistList.length > 0) {
					const { data } = await db.SaveArtistName(newArtistList);
					artistList = artistList.concat(data ?? []);
				}
			}

			const { tradeBodyList, tradeHeadList, susTradeIdList, error } = GetStoreData(
				tradeIdList,
				artistList,
				groupByOrder,
				timezoneOffset,
				dataHeader
			);
			if (error) {
				return { error: error };
			}
			susTradeIdLists = susTradeIdLists.concat(susTradeIdList ?? []);
			const {
				error: saveError,
				newTradeBody,
				newTradeHead
			} = await savePartToDb(tradeBodyList, tradeHeadList);
			if (saveError) {
				return { error: saveError };
			} else {
				return { error: null, newTradeBody, newTradeHead, susTradeIdLists };
			}
		}
		return { error: null, newTradeBody: [], newTradeHead: [], susTradeIdLists };
	};
</script>

<div class="flex flex-col items-center rounded-xl border-4 border-lele-line bg-lele-bg p-5">
	<form on:submit|preventDefault={handleSubmit} class="flex flex-col items-center gap-4 text-lg">
		<div>
			<!-- <label for="file">Upload your file</label> -->
			<input multiple type="file" id="file" name="fileToUpload" accept=".csv" required />
		</div>

		<button class="w-fit rounded-full bg-green-600 px-3 font-bold text-white" type="submit"
			>Submit</button
		>
	</form>

	{#if processed === ProcessedStatus.PROCESSING}
		<p class="text-7xl">Processing...</p>
	{:else if processed === ProcessedStatus.PROCESSED}
		<p class="text-7xl">DONE</p>
	{:else if processed === ProcessedStatus.ERROR}
		<p class="text-7xl text-red-600">{submitLog}</p>
	{/if}
	<div class="flex flex-col">
		<div class="text-center">共{newTradeHeadList.length}筆新交易</div>
		<div class="text-center">賣出{newTradeBodyList.length}次商品</div>

		{#if susTrade.length > 0}
			<div class="text-center">以下交易序號不是關閉狀態</div>
			{#each susTrade as tradeId}
				<div class="flex justify-start gap-4 text-lg">
					<div>交易序號：{tradeId}</div>
				</div>
			{/each}
		{/if}
	</div>
</div>
