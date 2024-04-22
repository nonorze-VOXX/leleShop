<script lang="ts">
	import ArtistListPart from './ArtistListPart.svelte';

	import LeleDataTable from '$lib/Component/LeleDataTable.svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { deserialize } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { goto, invalidateAll } from '$app/navigation';
	import type { Artist, ArtistRow, PaymentStatusRow, QueryTradeBodyWithTradeHead } from '$lib/db';
	import MonthTabReportTable from '$lib/Component/MonthTabReportTable.svelte';
	import LeleTable from '$lib/Component/htmlWrapper/LeleTable.svelte';
	import LeleThead from '$lib/Component/htmlWrapper/LeleThead.svelte';
	import LeleTbody from '$lib/Component/htmlWrapper/LeleTbody.svelte';
	import LeleTbodyTr from '$lib/Component/htmlWrapper/LeleTbodyTr.svelte';
	import { FormatNumberToTwoDigi } from '$lib/function/Utils';

	export let data: PageData;

	let tableData: string[][];
	let tableHead: string[] = ['artist name'];
	let artistData: ArtistRow[] = [];
	let tradeDataList: QueryTradeBodyWithTradeHead;
	enum TabEnum {
		artist_list,
		trade,
		report_key,
		payment
	}
	let tabType: TabEnum = TabEnum.artist_list;
	let paymentDataList:
		| {
				id: number;
				artist_name: string | null;
				visible: boolean;
				artist_payment_status: PaymentStatusRow[];
		  }[]
		| null = null;
	onMount(async () => {
		artistData = data.artistData ?? [];
		tableData = data.artistData?.map((artist) => {
			return [artist.artist_name, artist.report_key];
		}) as string[][];
		// tradeDataList = data.tradeDataList as QueryTradeBodyWithTradeHead;
		const date = new Date();
		let firstDay: Date = new Date(date.getFullYear(), date.getMonth() - 1, 1);
		let lastDay: Date = new Date(date.getFullYear(), date.getMonth(), 1);

		console.log(data.paymentStatus);
		paymentDataList = data.paymentStatus;
		await UpdateTradeData(firstDay, lastDay);
	});
	const UpdatePaymentStatus = async (paymentData: PaymentStatusRow) => {
		const data = new FormData();

		if (
			paymentData.year_month === null ||
			paymentData.process_state === null ||
			paymentData.artist_id === null ||
			paymentData.id === null
		) {
			console.log('data error please connect to developer');
			return;
		}
		const state = paymentData.process_state === 'done' ? 'todo' : 'done';
		console.log(paymentData.year_month);

		data.append('season', paymentData.year_month);
		data.append('process_state', state);
		data.append('artist_id', paymentData.artist_id.toString());
		data.append('payment_id', paymentData.id.toString());

		const response = await fetch('?/UpdatePaymentStatus', {
			method: 'POST',
			body: data
		});
		const result = deserialize(await response.text());
		console.log(result);
		if (result.type === 'success') {
			console.log('succ');
		} else if (result.type === 'failure') {
			console.log(result.data);
		} else if (result.type === 'redirect') {
			goto(result.location);
		}
	};
	const ButtonFunction = async (value: string[]) => {
		const data = new FormData();
		const artist = artistData.find((e) => e.artist_name == value[0]);
		if (artist === undefined) {
			return;
		}
		if (artist.id === undefined) {
			return;
		}
		data.append('id', artist.id.toString());
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
		} else if (result.type === 'redirect') {
			goto(result.location);
		}
	};
	let showedLength = 0;
	const UpdateVisiable = async (artistData: ArtistRow) => {
		const data = new FormData();
		data.append('id', artistData.id.toString());
		data.append('visible', artistData.visible.toString());
		const response = await fetch('?/UpdateArtistVisible', {
			method: 'POST',
			body: data
		});
		const result = deserialize(await response.text());
		if (result.type === 'success') {
			console.log('refresh');
			await invalidateAll();
		} else if (result.type === 'redirect') {
			goto(result.location);
		}
	};
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
	<ArtistListPart bind:data></ArtistListPart>
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
{#if tabType === TabEnum.payment}
	<LeleTable>
		<LeleThead>
			<tr>
				<th scope="col" class="w-auto p-2"> 品牌 </th>
				<th scope="col" class="w-40 p-2"> 繳交狀況</th>
			</tr>
		</LeleThead>
		<LeleTbody>
			{#if paymentDataList}
				{#each paymentDataList as p}
					<LeleTbodyTr>
						<td class="p-2">
							{p.artist_name}
						</td>
						<td>
							<div class="flex flex-col justify-around gap-2 py-2">
								{#each p.artist_payment_status as pay}
									<div class="flex justify-start gap-2 align-baseline">
										<div class="">
											{pay.year_month}
										</div>
										<label class="inline-flex cursor-pointer items-center">
											<input
												type="checkbox"
												checked={pay.process_state === 'done'}
												on:change={() => {
													UpdatePaymentStatus(pay);
												}}
												class="peer sr-only"
											/>
											<div
												class="peer relative z-10 h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-0 peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"
											></div>
										</label>
									</div>
								{/each}
							</div>
						</td>
					</LeleTbodyTr>
				{/each}
			{/if}
		</LeleTbody>
	</LeleTable>
{/if}
