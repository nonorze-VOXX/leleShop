<script lang="ts">
	import Toggle from './Toggle.svelte';

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

<LeleTable>
	<LeleThead>
		<tr>
			<th scope="col" class="w-auto p-2"> 品牌 </th>
			<th scope="col" class="w-20 p-2"> 銷售 </th>
			<th scope="col" class="w-20 p-2"> 可見 </th>
		</tr>
	</LeleThead>
	<LeleTbody>
		{#if artistData}
			{#each artistData as artists}
				<LeleTbodyTr>
					<td class="p-2">
						{artists.artist_name}
					</td>
					<td class="p-2">
						<a
							class="rounded-lg bg-lele-line p-2 text-lele-bg"
							href={'/lele/creator/' + artists.id}
						>
							報表
						</a>
					</td>
					<td>
						<Toggle
							bind:checked={artists.visible}
							on:change={() => {
								console.log(artists.visible);
								UpdateVisiable(artists);
							}}
						></Toggle>
					</td>
				</LeleTbodyTr>
			{/each}
		{/if}
	</LeleTbody>
</LeleTable>
