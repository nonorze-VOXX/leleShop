<script lang="ts">
	import DownloadButton from './DownloadButton.svelte';

	import MonthTabReportTableWithLogic1 from '$lib/Component/MonthTabReportTableWithLogic.svelte';

	import PasswordPanel from './PasswordPanel.svelte';
	import { onMount } from 'svelte';
	import OkButton from '$lib/UrlBox.svelte';
	import db from '$lib/db';
	import { page } from '$app/stores';
	import TradeCount from '$lib/Component/reportComponent/TradeCount.svelte';
	import Commision from '$lib/Component/reportComponent/Commision.svelte';

	let artist_name: string = '';
	let net_total = -1;
	let artist_id: string = '';
	let admit = false;
	let showedLength = 0;

	onMount(async () => {
		artist_id = $page.params.id;
		const artist_data = (await db.GetArtistData(artist_id)).data ?? [];
		artist_name = artist_data.length !== 0 ? artist_data[0].artist_name : 'not found this artist';
	});
	let firstDate: Date | null;
	let lastDate: Date | null;
</script>

<div class="flex flex-col items-center gap-3">
	{#if !admit}
		<PasswordPanel
			bind:artist_name
			bind:artist_id
			on:success={async () => {
				admit = true;
			}}
		></PasswordPanel>
	{:else}
		<div class="flex flex-col justify-center gap-4 text-center text-sm font-semibold">
			<h1 class="rounded-xl border-4 border-lele-line bg-lele-bg p-2 text-lele-line">
				{artist_name}
			</h1>
			<Commision bind:net_total></Commision>
			<TradeCount bind:showedLength></TradeCount>

			<DownloadButton bind:firstDate bind:lastDate bind:artist_id></DownloadButton>
		</div>
		<MonthTabReportTableWithLogic1
			bind:artist_id
			on:change={(e) => {
				net_total = e.detail.net_total;
				firstDate = e.detail.firstDate;
				lastDate = e.detail.lastDate;
			}}
		></MonthTabReportTableWithLogic1>
	{/if}
</div>
