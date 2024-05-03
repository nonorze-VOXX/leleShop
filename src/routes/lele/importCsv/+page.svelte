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
		LOGIN_FAILED,
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
	let processed: ProcessedStatus = ProcessedStatus.NORMAL;
	let submitLog: string = '';
	async function handleSubmit(event: { currentTarget: EventTarget & HTMLFormElement }) {
		const data = new FormData(event.currentTarget);
		processed = ProcessedStatus.PROCESSING;
		const { error, newTradeBody, newTradeHead } = await f(
			data,
			timeZoneOffsetToHHMM(new Date().getTimezoneOffset())
		);

		if (!error) {
			// submitLog = result.data?.error;
			newTradeBodyList = newTradeBody ?? [];
			newTradeHeadList = newTradeHead ?? [];
			processed = ProcessedStatus.PROCESSED;
			await invalidateAll();
		} else {
			processed = ProcessedStatus.LOGIN_FAILED;
			submitLog = error.toString();
			console.error(error);
		}
	}
	const f = async (formData: FormData, timezoneOffset: string) => {
		const files = formData.getAll('fileToUpload');
		if (files.length === 0) {
			return { error: 'You must provide a file to upload' };
		}

		for (let i = 0; i < files.length; i++) {
			const file = files[i] as File;
			const fileArr2D = await fileToArray(file);
			let dataHeader: string[] = [];
			dataHeader = fileArr2D[0];

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

			const { tradeBodyList, tradeHeadList, error } = GetStoreData(
				tradeIdList,
				artistList,
				groupByOrder,
				timezoneOffset,
				dataHeader
			);
			if (error) {
				return { error: error };
			}

			const {
				error: saveError,
				newTradeBody,
				newTradeHead
			} = await savePartToDb(tradeBodyList, tradeHeadList);
			if (saveError) {
				return { error: saveError };
			} else {
				return { error: null, newTradeBody, newTradeHead };
			}
		}
		return { error: null, newTradeBody: [], newTradeHead: [] };
	};
</script>

<div class="flex min-h-screen flex-col justify-center">
	<div class="flex flex-col items-center">
		<div class="flex flex-col items-center rounded-xl bg-white p-5">
			<form
				on:submit|preventDefault={handleSubmit}
				class="flex flex-col items-center gap-4 text-lg"
			>
				<div>
					<label for="file">Upload your file</label>
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
			{:else if processed === ProcessedStatus.LOGIN_FAILED}
				<p class="text-7xl text-red-600">{submitLog}</p>
			{/if}
		</div>
		<div class="flex flex-col">
			<div class="text-center">共{newTradeHeadList.length}筆新交易</div>
			<div class="text-center">賣出{newTradeBodyList.length}次商品</div>
			{#each newTradeHeadList as head}
				<div class="flex justify-start gap-4 text-lg">
					<div>交易序號：{head.trade_id}</div>
					<div>日期：{head.trade_date?.split('T')[0]}</div>
					<div>狀態：{head.state}</div>
				</div>
				{#each newTradeBodyList as body}
					{#if body.trade_id === head.trade_id}
						<div class="flex px-4">
							<div>品名：{body.item_name}</div>
						</div>
					{/if}
				{/each}
			{/each}
		</div>
	</div>
</div>
