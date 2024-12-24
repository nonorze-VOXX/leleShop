<script lang="ts">
	import { onMount } from 'svelte';
	import { DownloadData } from '$lib/function/Utils';
	import { page } from '$app/stores';
	import db from '$lib/db';
	import { selectedStore } from '$lib/store/choosing';

	let error_message: string = '';
	onMount(async () => {
		const artist_id = $page.params.id;
		const start_date = new Date($page.params.start_date);
		const end_date = new Date($page.params.end_date);
		const { csv, error } = await db.artistTrade.GetTradeCsv({
			id: parseInt(artist_id),
			date: {
				firstDate: start_date,
				lastDate: end_date
			},
			store_list: $selectedStore
		});
		if (error) {
			error_message = error.message;
		} else {
			if (csv && csv !== '\n') {
				DownloadData(csv ?? 'no data', 'data.csv');
				history.back();
			} else {
				error_message = 'no data';
			}
		}
	});
</script>

{#if error_message}
	<p>{error_message}</p>
{/if}
