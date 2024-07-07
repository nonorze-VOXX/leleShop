<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import type { ShopRow, TradeBodyRow, TradeHeadRow } from '$lib/db';
	import {
		GetDateRange,
		GetNewArtistList,
		GetStoreData,
		fileToArray,
		timeZoneOffsetToHHMM,
		savePartToDb,
		tradeIdIndex
	} from './importFunction';
	import { groupBy } from '$lib/function/Utils';
	import db, { supabase } from '$lib/db';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let shopList: ShopRow[] = [];

	onMount(async () => {
		const { data, error } = await supabase.from('shop').select('*');
		if (error) {
			console.error(error);
			return;
		}
		shopList = data;
		if ($page.url.searchParams.get('shop_id') === null) {
			const param = new URLSearchParams($page.url.searchParams);
			param.set('shop_id', '1');
			goto(`?${param.toString()}`);
		}
	});
	enum ProcessedStatus {
		NORMAL,
		PROCESSING,
		ERROR,
		PROCESSED
	}

	let newTradeHeadList: TradeHeadRow[] = [];
	let newTradeBodyList: TradeBodyRow[] = [];
	let susTrade: string[] = [];
	let processed: ProcessedStatus = ProcessedStatus.NORMAL;
	let submitLog: string = '';
	async function handleSubmit(event: { currentTarget: EventTarget & HTMLFormElement }) {
		const data = new FormData(event.currentTarget);
		processed = ProcessedStatus.PROCESSING;
		const {
			error,
			newTradeBodys: newTradeBody,
			newTradeHeads: newTradeHead,
			susTradeIdLists
		} = await f(data, timeZoneOffsetToHHMM(new Date().getTimezoneOffset()));

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
		//todo: use for or some to speed up #performance
		const files = formData.getAll('fileToUpload');
		const shop_idStr = $page.url.searchParams.get('shop_id');
		if (shop_idStr === null) {
			return { error: 'shop_id is null' };
		}
		var shop_id: number = parseInt(shop_idStr);
		if (files.length === 0) {
			return { error: 'You must provide a file to upload' };
		}
		let susTradeIdLists: string[] = [];
		const result = (
			await Promise.all(
				files.map(async (tmpFile) => {
					const file = tmpFile as File;
					const fileArr2D = await fileToArray(file);
					let dataHeader: string[] = [];
					dataHeader = fileArr2D[0];
					if (!dataHeader) {
						return null;
					}
					return { body: fileArr2D.slice(1), dataHeader };
				})
			)
		)
			.filter((file) => file !== null)
			.map(({ body, dataHeader }) => {
				return { groupByOrder: groupBy(body, (i) => i[tradeIdIndex(dataHeader)]), dataHeader };
			});
		const groupAndHeaderAndDateRange = await Promise.all(
			result.map(async ({ groupByOrder, dataHeader }) => {
				const dateRange = await GetDateRange(groupByOrder, dataHeader, timezoneOffset);
				return { dateRange, dataHeader, groupByOrder };
			})
		);
		const tradeIdList = await Promise.all(
			groupAndHeaderAndDateRange.map(async ({ dateRange, dataHeader, groupByOrder }) => {
				return (
					(
						await db.GetTradeIdList({
							firstDate: dateRange.minDate,
							lastDate: dateRange.maxDate
						})
					).data ?? []
				);
			})
		);
		const artistList = await Promise.all(
			result.map(
				async ({ groupByOrder, dataHeader }, index) => (await db.GetArtistDataList()).data ?? []
			)
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
					tradeIdList[index],
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

		storeDataList.map(async ({ tradeBodyList, tradeHeadList }) => {
			const { error, newTradeBody, newTradeHead } = await savePartToDb(
				tradeBodyList,
				tradeHeadList
			);
			if (error) {
				console.error(error);
				errors.push(error.message);
			} else {
				newTradeBodys.concat(newTradeBody);
				newTradeHeads.concat(newTradeHead);
			}
		});
		return {
			error: errors.length ? null : errors[0],
			newTradeBodys,
			newTradeHeads,
			susTradeIdLists
		};
	};

	async function handleShopChange(event: { currentTarget: EventTarget & HTMLFormElement }) {
		const formData = new FormData(event.currentTarget);
		const param = new URLSearchParams($page.url.searchParams);
		param.set('shop_id', formData.get('shops') as string);
		goto(`?${param.toString()}`);
	}
</script>

<div class="flex flex-col items-center rounded-xl border-4 border-lele-line bg-lele-bg p-5">
	<form
		on:change|preventDefault={handleShopChange}
		class="flex flex-col items-center gap-4 text-lg"
	>
		<div>
			<label for="shops">Choose Shop:</label>

			<select name="shops" id="shops" class="p-2">
				{#each shopList as shop}
					<option value={shop.id}>{shop.shop_name}</option>
				{/each}
			</select>
		</div>
	</form>
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
