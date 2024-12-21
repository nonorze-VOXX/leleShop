<script lang="ts">
	import MonthTabReportTableWithLogic from '$lib/Component/MonthTabReportTableWithLogic.svelte';

	import { onMount } from 'svelte';
	import db, { supabase } from '$lib/db';
	import { page } from '$app/stores';
	import TradeCount from '$lib/Component/reportComponent/TradeCount.svelte';
	import Commision from '$lib/Component/reportComponent/Commision.svelte';
	import Remit from '$lib/Component/reportComponent/Remit.svelte';
	import InfoBox from '$lib/Component/InfoBox.svelte';

	let artist_name: string = '';
	let artist_id: number = Number($page.params.creator_id);
	let showedLength = 0;
	let store_name: string = '*';
	let view_store_name: string = '';
	let logText: string = '';
	onMount(async () => {
		const artist_data = (await db.GetArtistData(artist_id)).data ?? [];
		artist_name = artist_data.length !== 0 ? artist_data[0].artist_name : 'not found this artist';

		{
			const store_id = $page.params.store_id === '*' ? '*' : Number($page.params.store_id);
			if (store_id !== '*' && isNaN(store_id)) {
				logText = 'store_id is not a number';
				return;
			}
			let query = supabase.from('store').select('*');
			if (store_id !== '*') {
				query = query.eq('id', store_id);
			}
			const { data, error } = await query;
			if (error) {
				logText = error.message;
				return;
			}
			view_store_name = data.reduce(
				(acc, cur) => (acc === '' ? acc + cur.store_name : acc + ', ' + cur.store_name),
				''
			);
			if (data.length > 1) {
				store_name = '*';
			}
		}
	});
	let net_total: null | number = null;
</script>

<div class="flex flex-col items-center gap-3">
	<div class="flex flex-wrap justify-center gap-4 text-center text-sm font-semibold">
		<InfoBox title={view_store_name}></InfoBox>
		<InfoBox title={artist_name}></InfoBox>
		<Commision bind:net_total></Commision>
		<TradeCount bind:showedLength></TradeCount>
		<Remit bind:net_total></Remit>

		<!-- <DownloadButton bind:firstDate bind:lastDate bind:artist_id></DownloadButton> -->
	</div>
	<MonthTabReportTableWithLogic
		bind:artist_id
		on:change={(e) => {
			net_total = e.detail.net_total;
			showedLength = e.detail.showedLength;
		}}
	></MonthTabReportTableWithLogic>
</div>
