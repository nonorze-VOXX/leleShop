<script lang="ts">
	import AdminTradeTable from './AdminTradeTable.svelte';
	import ReportKeyTable from './ReportKeyTable.svelte';
	import ArtistListPart from './ArtistListPart.svelte';

	import { onMount } from 'svelte';
	import type { ArtistRow } from '$lib/db';
	import PaymentTable from './PaymentTable.svelte';
	import db from '$lib/db';
	import ImportPart from './importPart.svelte';
	import LeleTable from '$lib/Component/htmlWrapper/LeleTable.svelte';
	import LeleThead from '$lib/Component/htmlWrapper/LeleThead.svelte';
	import LeleTbody from '$lib/Component/htmlWrapper/LeleTbody.svelte';
	import { GetTradeTotalDataEachOne } from './leleFunction';
	import { NextMonthFirstDate, ThisMonthFirstDate } from '$lib/function/Utils';

	let artistData: ArtistRow[] = [];
	enum TabEnum {
		artist_list,
		trade,
		report_key,
		payment,
		total,
		import
	}
	let tabType: TabEnum = TabEnum.artist_list;
	let totalData: { total_sales_sum: number; net_sales_sum: number; discount_sum: number } = {
		total_sales_sum: -1,
		net_sales_sum: -1,
		discount_sum: -1
	};
	onMount(async () => {
		artistData = (await db.GetArtistDataList())?.data ?? [];
		const { total_sales_sum, net_sales_sum, discount_sum, error } = await GetTradeTotalDataEachOne(
			ThisMonthFirstDate(),
			NextMonthFirstDate()
		);
		if (error) {
			console.error(error);
			return;
		}
		console.log(total_sales_sum, net_sales_sum, discount_sum);

		totalData = { total_sales_sum, net_sales_sum, discount_sum };
	});
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
	<button
		class="flex rounded-xl bg-lele-line p-2 font-semibold text-lele-bg"
		on:click={() => (tabType = TabEnum.import)}>import</button
	>
	<button
		class="flex rounded-xl bg-lele-line p-2 font-semibold text-lele-bg"
		on:click={() => (tabType = TabEnum.total)}>Total</button
	>
</div>

{#if tabType === TabEnum.total}
	<div class="flex flex-col items-center rounded-xl border-4 border-lele-line bg-lele-bg p-5">
		<LeleTable>
			<LeleThead>
				<tr>Total</tr>
			</LeleThead>
			<LeleTbody></LeleTbody>
		</LeleTable>
	</div>
{/if}
{#if tabType === TabEnum.artist_list}
	<ArtistListPart bind:artistData></ArtistListPart>
{/if}
{#if tabType === TabEnum.trade}
	<AdminTradeTable></AdminTradeTable>
{/if}
{#if tabType === TabEnum.report_key}
	<ReportKeyTable bind:artistData></ReportKeyTable>
{/if}
{#if tabType === TabEnum.payment}
	<PaymentTable></PaymentTable>
{/if}
{#if tabType === TabEnum.import}
	<ImportPart></ImportPart>
{/if}
