<script lang="ts">
	import type { QueryTradeBodyWithTradeHead } from '$lib/db';
	import OkButton from '$lib/UrlBox.svelte';

	export let artist_name: string;
	export let queryTradeBodyWithTradeHead: QueryTradeBodyWithTradeHead;

	let encodeDataForDownload = '';
	$: {
		UpdateDownloadData(queryTradeBodyWithTradeHead);
	}
	const UpdateDownloadData = (data: QueryTradeBodyWithTradeHead) => {
		encodeDataForDownload = '日期,收據號碼,商品,數量,銷售總額,折扣,類別,狀態,淨銷售額%0A';
		data.forEach((element) => {
			encodeDataForDownload += element.trade_head?.trade_date + ',';
			encodeDataForDownload += element.trade_head?.trade_id + ',';
			encodeDataForDownload += element.item_name + ',';
			encodeDataForDownload += element.quantity + ',';
			encodeDataForDownload += element.total_sales + ',';
			encodeDataForDownload += element.discount + ',';
			encodeDataForDownload += artist_name + ',';
			encodeDataForDownload += '關閉' + ',';
			encodeDataForDownload += element.net_sales + '%0A';
		});
	};
</script>

<OkButton>
	<a
		href={'data:text/plain;charset=utf-8,' + encodeDataForDownload}
		download="data.csv"
		class="inline-block w-full py-2">download</a
	>
</OkButton>
