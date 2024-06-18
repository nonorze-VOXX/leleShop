<script lang="ts">
	import MonthTabReportTableWithLogic from './MonthTabReportTableWithLogic.svelte';

	import { onMount } from 'svelte';
	import db from '$lib/db';
	import { page } from '$app/stores';
	import TradeCount from '$lib/Component/reportComponent/TradeCount.svelte';
	import Commision from '$lib/Component/reportComponent/Commision.svelte';
	import Remit from '$lib/Component/reportComponent/Remit.svelte';

	let artist_name: string = '';
	let artist_id: string = '';
	let showedLength = 0;
	onMount(async () => {
		artist_id = $page.params.id;
		const artist_data = (await db.GetArtistData(artist_id)).data ?? [];
		artist_name = artist_data.length !== 0 ? artist_data[0].artist_name : 'not found this artist';
	});
	let net_total: null | number = null;
</script>

<div class="flex flex-col items-center gap-3">
	<div class="flex flex-col justify-center gap-4 text-center text-sm font-semibold">
		<h1 class="rounded-xl bg-lele-line p-2 text-lele-bg">{artist_name}</h1>
		<Commision bind:net_total></Commision>
		<TradeCount bind:showedLength></TradeCount>
		<Remit bind:net_total></Remit>
	</div>
	<MonthTabReportTableWithLogic
		bind:artist_id
		on:change={(e) => {
			net_total = e.detail.net_total;
		}}
	></MonthTabReportTableWithLogic>
</div>
