<script lang="ts">
	import ArtistListPart from './ArtistListPart.svelte';

	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { deserialize } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { goto, invalidateAll } from '$app/navigation';
	import type { ArtistRow, PaymentStatusRow, QueryTradeBodyWithTradeHead } from '$lib/db';
	import MonthTabReportTable from '$lib/Component/MonthTabReportTable.svelte';
	import PaymentTable from './PaymentTable.svelte';
	import db, { supabase } from '$lib/db';
	import { randomNumber } from '$lib/function/Utils';
	import { LeleTbody, LeleTable, LeleTbodyTr, LeleThead } from '$lib/Component/htmlWrapper';

	let artistData: ArtistRow[] = [];
	let tradeDataList: QueryTradeBodyWithTradeHead;
	enum TabEnum {
		artist_list,
		trade,
		report_key,
		payment
	}
	let tabType: TabEnum = TabEnum.artist_list;
	onMount(async () => {
		artistData = (await db.GetArtistDataList())?.data ?? [];
		const date = new Date();
		let firstDay: Date = new Date(date.getFullYear(), date.getMonth() - 1, 1);
		let lastDay: Date = new Date(date.getFullYear(), date.getMonth(), 1);

		await UpdateTradeData(firstDay, lastDay);
	});
	const ButtonFunction = async (id: number) => {
		const random = randomNumber(5);
		const { data, error } = await supabase
			.from('artist')
			.update({ report_key: random })
			.eq('id', id)
			.select()
			.single();

		if (error) {
			console.error(error);
			goto('/');
			return;
		}

		const key = data?.report_key;
		let artistIndex = artistData.findIndex((e) => e.id === id);
		if (artistIndex !== undefined) {
			if (key) artistData[artistIndex].report_key = key;
			else {
				artistData[artistIndex].report_key = 'error';
				console.error('error');
			}
		}
	};
	let showedLength = 0;
	const UpdateTradeData = async (firstDate: Date, lastDate: Date) => {
		const tradeData = (
			await db.GetTradeData('*', {
				firstDate: new Date(firstDate),
				lastDate: new Date(lastDate)
			})
		).data;

		const { count } = await db.GetTradeDataCount('*', {
			firstDate: firstDate,
			lastDate: lastDate
		});

		tradeDataList = tradeData;
		showedLength = count ?? -1;
	};
</script>

<div class="flex justify-start gap-2 p-2">
	<button
		on:click={() => (tabType = TabEnum.artist_list)}
		class="flex rounded-xl bg-lele-line p-2 font-semibold text-lele-bg">Artist List</button
	>
	<button
		class="flex rounded-xl bg-lele-line p-2 font-semibold text-lele-bg"
		on:click={() => (tabType = TabEnum.trade)}>Trade</button
	>
	<button
		class="flex rounded-xl bg-lele-line p-2 font-semibold text-lele-bg"
		on:click={() => (tabType = TabEnum.report_key)}>Manage Key</button
	>
	<button
		class="flex rounded-xl bg-lele-line p-2 font-semibold text-lele-bg"
		on:click={() => (tabType = TabEnum.payment)}>payment</button
	>
</div>

<div
	class="h-fit w-fit rounded-lg border-4 border-lele-line p-2
		 text-base text-lele-line"
>
	<a href="/lele/importCsv">import csv</a>
</div>
{#if tabType === TabEnum.artist_list}
	<ArtistListPart bind:artistData></ArtistListPart>
{/if}
{#if tabType === TabEnum.trade}
	<div class="flex flex-col gap-2">
		<div class="flex px-2">
			<div class="rounded-xl bg-lele-line p-2 text-lele-bg">
				交易次數：{showedLength}
			</div>
		</div>
		<MonthTabReportTable
			bind:tradeDataList
			on:changeShowedDataList={(e) => {
				UpdateTradeData(e.detail.firstDay, e.detail.lastDay);
			}}
		></MonthTabReportTable>
	</div>
{/if}
{#if tabType === TabEnum.report_key}
	<LeleTable>
		<LeleThead>
			<tr>
				<th scope="col" class="w-auto p-2"> artist_name </th>
				<th scope="col" class="w-20 p-2"> key </th>
				<th scope="col" class="w-20 p-2"> </th>
			</tr>
		</LeleThead>
		<LeleTbody>
			{#each artistData as artist}
				<LeleTbodyTr>
					<td>{artist.artist_name}</td>
					<td>{artist.report_key}</td>
					<td>
						<button
							class="grow rounded-lg bg-lele-line p-2 text-center text-lele-bg"
							on:click={async () => {
								await ButtonFunction(artist.id);
							}}
						>
							更新
						</button>
					</td>
				</LeleTbodyTr>
			{/each}
		</LeleTbody>
	</LeleTable>
{/if}
{#if tabType === TabEnum.payment}
	<PaymentTable></PaymentTable>
{/if}
