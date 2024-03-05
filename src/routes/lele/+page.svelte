<script lang="ts">
	import LeleDataTable from '$lib/Component/LeleDataTable.svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { deserialize } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { invalidateAll } from '$app/navigation';
	import type { Artist, QueryTradeBodyWithTradeHead } from '$lib/db';
	import MonthTabReportTable from '$lib/Component/MonthTabReportTable.svelte';

	export let data: PageData;

	let tableData: string[][];
	let tableHead: string[] = ['artist name'];
	let artistData: Artist[] = [];
	let tradeDataList: QueryTradeBodyWithTradeHead;
	enum TabEnum {
		artist_list,
		trade,
		report_key
	}
	let tabType: TabEnum = TabEnum.artist_list;
	onMount(async () => {
		artistData = data.data as unknown as Artist[];
		tableData = data.data?.map((artist) => {
			return [artist.artist_name, artist.report_key];
		}) as string[][];
		// tradeDataList = data.tradeDataList as QueryTradeBodyWithTradeHead;
		const date = new Date();
		let firstDay: Date = new Date(date.getFullYear(), date.getMonth() - 1, 1);
		let lastDay: Date = new Date(date.getFullYear(), date.getMonth(), 1);
		UpdateTradeData(firstDay, lastDay);
	});
	const ButtonFunction = async (value: string[]) => {
		const data = new FormData();
		const artist = artistData.find((e) => e.artist_name == value[0]);
		if (artist === undefined) {
			return;
		}
		if (artist.id === undefined) {
			return;
		}
		data.append('id', artist.id as string);
		const response = await fetch('?/UpdateReportKey', {
			method: 'POST',
			body: data
		});
		const result: ActionResult = deserialize(await response.text());
		if (result.type === 'success') {
			console.log('refresh');
			let artistIndex = tableData.findIndex((e) => e[0] === artist.artist_name);
			console.log(artistIndex);

			if (artistIndex !== undefined) {
				tableData[artistIndex][1] = result.data?.key;
			}
			await invalidateAll();
		}
	};
	let showedLength = 0;
	const UpdateTradeData = async (firstDate: Date, lastDate: Date) => {
		const data = new FormData();
		data.append('firstDate', firstDate.toISOString());
		data.append('lastDate', lastDate.toISOString());
		const response = await fetch('?/UpdateTradeData', {
			method: 'POST',
			body: data
		});
		const result = deserialize(await response.text());
		if (result.type === 'success') {
			tradeDataList = result.data?.tradeDataList as QueryTradeBodyWithTradeHead;
			showedLength = result.data?.count as number;
		}
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
</div>

{#if tabType === TabEnum.artist_list}
	<div class="flex h-fit w-screen flex-wrap gap-4 p-4">
		<div class="h-fit w-fit rounded-lg border-4 border-blue-700 p-3 text-5xl">
			<a href="/lele/importCsv">import csv</a>
		</div>
	</div>
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
	<LeleDataTable
		bind:tableHead
		bind:tableData
		buttonPart={{ haveButton: true, buttonText: 'update key', ButtonFunction }}
	></LeleDataTable>
{/if}
