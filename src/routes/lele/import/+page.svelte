<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import type { ShopInsert, ShopRow, TradeBodyRow, TradeHeadRow } from '$lib/db';
	import {
		GetDateRange,
		GetNewArtistList,
		GetStoreData,
		timeZoneOffsetToHHMM,
		FileListToHeadAndBody,
		HeaderAndBodyToGroupByOrderDataHeader,
		GetInDbTradeIdList,
		tradeIdIndex,
		savePartToDb,
		GetShopIndex,
		GetNewShopNameList
	} from './importFunction';
	import db, { supabase } from '$lib/db';
	import { onMount } from 'svelte';
	import OkButton from '$lib/UrlBox.svelte';

	let newTradeLength: { head: number; body: number } = { head: 0, body: 0 };

	onMount(async () => {});
	enum ProcessedStatus {
		NORMAL,
		PROCESSING,
		ERROR,
		PROCESSED
	}

	let susTrade: string[] = [];
	let processed: ProcessedStatus = ProcessedStatus.NORMAL;
	let submitLog: string = '';
	async function handleSubmit(event: { currentTarget: EventTarget & HTMLFormElement }) {
		const data = new FormData(event.currentTarget);
		processed = ProcessedStatus.PROCESSING;
		const { HeadAndBody } = await FormData_HeadAnyBody(data);
		if (HeadAndBody === undefined) {
			processed = ProcessedStatus.ERROR;
			submitLog = 'HeadAndBody or timezoneOffset is undefined';
			return;
		}
		const FilteredBodyHead = await Promise.all(
			HeadAndBody.map(async (e) => {
				const { filtered_body: body } = await HeadBody_FilteredBody(e);
				return {
					dataHeader: e.dataHeader,
					body
				};
			})
		);

		{
			// todo new shop on ui
			const newShopList = await GetNewShopNameList(FilteredBodyHead);
			if (newShopList.length !== 0) {
				const { data: newShop, error } = await supabase
					.from('shop')
					.insert(newShopList.map((shop_name) => ({ shop_name, commission: 0 })))
					.select();
				console.log('newSHOP!!!!');
				console.log(newShop, error);
			}
		}
		const {
			error,
			newTradeBodys: newTradeBody,
			newTradeHeads: newTradeHead,
			susTradeIdLists
		} = await f2(FilteredBodyHead, timeZoneOffsetToHHMM(new Date().getTimezoneOffset()));

		if (!error) {
			// submitLog = result.data?.error;
			newTradeLength = {
				body: (newTradeBody ?? []).length,
				head: (newTradeHead ?? []).length
			};
			susTrade = susTradeIdLists ?? [];
			processed = ProcessedStatus.PROCESSED;
			await invalidateAll();
		} else {
			processed = ProcessedStatus.ERROR;
			submitLog = error.toString();
			console.error(error);
		}
	}
	const FormData_HeadAnyBody = async (formData: FormData) => {
		//todo: use for or some to speed up #performance
		const files = formData.getAll('fileToUpload');
		if (files.length === 0) {
			return { error: 'You must provide a file to upload' };
		}
		const HeadAndBody = await FileListToHeadAndBody(files);
		return { error: null, HeadAndBody };
	};

	const HeadBody_FilteredBody = async (HeadAndBody: { body: string[][]; dataHeader: string[] }) => {
		const e = HeadAndBody;
		const idList = e.body.map((ee) => ee[tradeIdIndex(e.dataHeader)]);
		const IdsInDb = await GetInDbTradeIdList(idList);
		const tradeIdI = tradeIdIndex(e.dataHeader);
		const filtered_body = e.body.filter((e) => !IdsInDb.includes(e[tradeIdI]));
		return { filtered_body };
	};

	const f2 = async (
		HeadAndBody: {
			body: string[][];
			dataHeader: string[];
		}[],
		timezoneOffset: string
	) => {
		const shop_id = 1;
		let susTradeIdLists: string[] = [];
		const groupByOrder_DataHeader = await HeaderAndBodyToGroupByOrderDataHeader(HeadAndBody);
		const groupAndHeaderAndDateRange = await Promise.all(
			groupByOrder_DataHeader.map(async ({ groupByOrder, dataHeader }) => {
				const dateRange = await GetDateRange(groupByOrder, dataHeader, timezoneOffset);
				return { dateRange, dataHeader, groupByOrder };
			})
		);
		const artistList = await Promise.all(
			groupByOrder_DataHeader.map(async () => (await db.GetArtistDataList()).data ?? [])
		);
		const newArtistList = await Promise.all(
			artistList
				.map((artistList, index) =>
					GetNewArtistList(
						artistList,
						groupAndHeaderAndDateRange[index].groupByOrder,
						groupAndHeaderAndDateRange[index].dataHeader
					)
				)
				.filter((newArtistList) => newArtistList.length > 0)
				.map(async (newArtistList) => {
					const { data } = await db.SaveArtistName(newArtistList);
					return data ?? [];
				})
		);
		artistList.forEach((list, index) => {
			list.concat(newArtistList[index]);
		});
		const storeDataList = artistList
			.map((list, index) => {
				return GetStoreData(
					list,
					groupAndHeaderAndDateRange[index].groupByOrder,
					timezoneOffset,
					groupAndHeaderAndDateRange[index].dataHeader,
					shop_id
				);
			})
			.filter((e) => e.error === null)
			.map(({ susTradeIdList, tradeBodyList, tradeHeadList }, index) => {
				susTradeIdLists = susTradeIdLists.concat(susTradeIdList ?? []);
				return { tradeBodyList, tradeHeadList };
			});
		const errors: string[] = [];
		const newTradeBodys: TradeBodyRow[] = [],
			newTradeHeads: TradeHeadRow[] = [];

		await Promise.all(
			storeDataList.map(async ({ tradeBodyList, tradeHeadList }) => {
				console.log('data store to db start');
				console.log(tradeBodyList, tradeHeadList);
				const { error, newTradeBody, newTradeHead } = await savePartToDb(
					tradeBodyList,
					tradeHeadList
				);
				if (error) {
					console.error(error);
					errors.push(error.message);
				} else {
					newTradeBodys.push(...newTradeBody);
					newTradeHeads.push(...newTradeHead);
				}
			})
		);

		console.log('data store to db end');
		console.log(newTradeBodys, newTradeHeads);
		return {
			error: errors.length ? null : errors[0],
			newTradeBodys,
			newTradeHeads,
			susTradeIdLists
		};
	};
</script>

<div class="flex flex-col items-center gap-4 rounded-xl border-4 border-lele-line bg-lele-bg p-5">
	<OkButton>
		<a class="p-2" href={'/lele/import/editShop'}> edit shop</a>
	</OkButton>
	<form on:submit|preventDefault={handleSubmit} class="flex flex-col items-center gap-4 text-lg">
		<div>
			<!-- <label for="file">Upload your file</label> -->
			<input multiple type="file" id="file" name="fileToUpload" accept=".csv" />
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
		<div class="text-center">共{newTradeLength.head}筆新交易</div>
		<div class="text-center">賣出{newTradeLength.body}次商品</div>

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
