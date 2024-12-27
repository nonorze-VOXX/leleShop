<script lang="ts">
	import MonthTabReportTableWithLogic from '$lib/Component/MonthTabReportTableWithLogic.svelte';

	import { onMount } from 'svelte';
	import db from '$lib/db';
	import { page } from '$app/stores';
	import TradeCount from '$lib/Component/reportComponent/TradeCount.svelte';
	import InfoBox from '$lib/Component/InfoBox.svelte';
	import { FormatNumberToTwoDigi } from '$lib/function/Utils';
	import RemitAndCommission from '$lib/Component/reportComponent/RemitAndCommission.svelte';

	let artist_name: string = '';
	let artist_id: number = Number($page.params.creator_id);
	let showedLength = 0;
	onMount(async () => {
		const artist_data = (await db.GetArtistData(artist_id)).data ?? [];
		artist_name = artist_data.length !== 0 ? artist_data[0].artist_name : 'not found this artist';
	});
	let net_total: null | number = null;
	let year_month: string | null = null;
</script>

<div class="flex flex-col items-center gap-3">
	<div class="flex flex-wrap justify-center gap-4 text-center text-sm font-semibold">
		<InfoBox title={artist_name}></InfoBox>
		<TradeCount bind:showedLength></TradeCount>
		{#if year_month}
			<RemitAndCommission {net_total} {artist_id} {year_month} />
		{/if}

		<!-- <DownloadButton bind:firstDate bind:lastDate bind:artist_id></DownloadButton> -->
	</div>
	<MonthTabReportTableWithLogic
		bind:artist_id
		on:change={(e) => {
			net_total = e.detail.net_total;
			showedLength = e.detail.showedLength;
			year_month =
				e.detail.firstDate?.getFullYear().toString() +
				'-' +
				FormatNumberToTwoDigi((e.detail.firstDate?.getMonth() + 1).toString());
		}}
	></MonthTabReportTableWithLogic>
</div>
