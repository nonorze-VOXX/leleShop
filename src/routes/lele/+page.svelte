<script lang="ts">
	import AdminTradeTable from './AdminTradeTable.svelte';
	import ReportKeyTable from './ReportKeyTable.svelte';
	import ArtistListPart from './ArtistListPart.svelte';

	import { onMount } from 'svelte';
	import type { ArtistRow } from '$lib/db';
	import PaymentTable from './PaymentTable.svelte';
	import db from '$lib/db';
	import ImportPart from './importPart.svelte';

	let artistData: ArtistRow[] = [];
	enum TabEnum {
		artist_list,
		trade,
		report_key,
		payment,
		import
	}
	let tabType: TabEnum = TabEnum.artist_list;
	onMount(async () => {
		artistData = (await db.GetArtistDataList())?.data ?? [];
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
</div>

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
