<script lang="ts">
	import { onMount } from 'svelte';
	import { DownloadData } from '$lib/function/Utils';
	import { page } from '$app/stores';
	import db from '$lib/db';

	async function GetName(id: string) {
		const { data } = await db.GetArtistData(id);
		if (data == null || data.length === 0) {
			return '';
		}
		return data[0].artist_name;
	}
	onMount(async () => {
		const artist_id = $page.params.id;
		const start_date = new Date($page.params.start_date);
		const end_date = new Date($page.params.end_date);
		const artist_name = await GetName(artist_id);
		const { data } = await db.GetTradeData(artist_id, {
			firstDate: start_date,
			lastDate: end_date
		});
		let encodeDataForDownload = '';
		encodeDataForDownload = '日期,收據號碼,商品,數量,銷售總額,折扣,類別,狀態,淨銷售額\n';
		data.forEach((element) => {
			encodeDataForDownload += element.trade_head?.trade_date + ',';
			encodeDataForDownload += element.trade_head?.trade_id + ',';
			encodeDataForDownload += element.item_name + ',';
			encodeDataForDownload += element.quantity + ',';
			encodeDataForDownload += element.total_sales + ',';
			encodeDataForDownload += element.discount + ',';
			encodeDataForDownload += artist_name + ',';
			encodeDataForDownload += '關閉' + ',';
			encodeDataForDownload += element.net_sales + '\n';
		});
		DownloadData(encodeDataForDownload, 'data.csv');
		history.back();
	});
</script>
