<script lang="ts">
	import { onMount } from 'svelte';
	import { DownloadData } from '$lib/function/Utils';
	import { page } from '$app/stores';
	import db from '$lib/db';
	import DbArtistTrade from '$lib/db/DbArtistTrade';

	onMount(async () => {
		const artist_id = $page.params.id;
		const start_date = new Date($page.params.start_date);
		const end_date = new Date($page.params.end_date);

		const { csv, error } = await DbArtistTrade.GetTradeFullData({
			id: parseInt(artist_id),
			date: {
				firstDate: start_date,
				lastDate: end_date
			},
			csv: true
		});
		DownloadData(csv ?? 'no data found or error: ' + error ?? 'no error', 'data.csv');
		history.back();
	});
</script>
