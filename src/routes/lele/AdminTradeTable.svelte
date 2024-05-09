<script lang="ts">
	import { onMount } from 'svelte';
	import type { QueryTradeBodyWithTradeHead } from '$lib/db';
	import MonthTabReportTable from '$lib/Component/MonthTabReportTable.svelte';
	import db from '$lib/db';

	let tradeDataList: QueryTradeBodyWithTradeHead | undefined;
	onMount(async () => {
		const date = new Date();
		let firstDay: Date = new Date(date.getFullYear(), date.getMonth() - 1, 1);
		let lastDay: Date = new Date(date.getFullYear(), date.getMonth(), 1);

		await UpdateTradeData(firstDay, lastDay);
	});
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

<div class="flex flex-col gap-2">
	<div class="flex px-2">
		<div class="rounded-xl bg-lele-line p-2 text-lele-bg">
			交易次數：{showedLength}
		</div>
	</div>
	{#if tradeDataList}
		<MonthTabReportTable
			bind:tradeDataList
			on:changeShowedDataList={(e) => {
				UpdateTradeData(e.detail.firstDay, e.detail.lastDay);
			}}
		></MonthTabReportTable>
	{/if}
</div>
