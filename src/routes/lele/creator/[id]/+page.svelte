<script lang="ts">
	import MonthTabReportTableWithLogic from '$lib/Component/MonthTabReportTableWithLogic.svelte';

	import { onMount } from 'svelte';
	import db, { type ShopRow } from '$lib/db';
	import { page } from '$app/stores';
	import TradeCount from '$lib/Component/reportComponent/TradeCount.svelte';
	import Commision from '$lib/Component/reportComponent/Commision.svelte';
	import Remit from '$lib/Component/reportComponent/Remit.svelte';
	import { goto } from '$app/navigation';

	let artist_name: string = '';
	let artist_id: string = $page.params.id;
	let showedLength = 0;
	let shop_id: number | null | '*' = '*';
	let shopList: ShopRow[] = [];

	onMount(async () => {
		const artist_data = (await db.GetArtistData(artist_id)).data ?? [];
		artist_name = artist_data.length !== 0 ? artist_data[0].artist_name : 'not found this artist';

		const { data } = await db.GetShopList();
		shopList = data ?? [];
		let paramId = $page.url.searchParams.get('shop_id');
		if (paramId === null) {
			shop_id = '*';
		} else {
			shop_id = parseInt(paramId);
		}
	});
	let net_total: null | number = null;
	async function handleShopChange(event: { currentTarget: EventTarget & HTMLFormElement }) {
		const formData = new FormData(event.currentTarget);
		const param = new URLSearchParams($page.url.searchParams);
		param.set('shop_id', formData.get('shops') as string);
		goto(`?${param.toString()}`);
	}
</script>

<div class="flex flex-col items-center gap-3">
	<div class="flex flex-col justify-center gap-4 text-center text-sm font-semibold">
		<h1 class="rounded-xl bg-lele-line p-2 text-lele-bg">{artist_name}</h1>
		<Commision bind:net_total></Commision>
		<TradeCount bind:showedLength></TradeCount>
		<Remit bind:net_total></Remit>
		<form
			on:change|preventDefault={handleShopChange}
			class="flex flex-col items-center gap-4 text-lg"
		>
			<div>
				<label for="shops">Choose Shop:</label>

				<select name="shops" id="shops" class="p-2" bind:value={shop_id}>
					<option value={'*'}>All</option>
					{#each shopList as shop}
						<option value={shop.id}>{shop.shop_name}</option>
					{/each}
				</select>
			</div>
		</form>
	</div>
	{#if shop_id}
		<MonthTabReportTableWithLogic
			bind:shop_id
			bind:artist_id
			on:change={(e) => {
				net_total = e.detail.net_total;
				showedLength = e.detail.showedLength;
			}}
		></MonthTabReportTableWithLogic>
	{/if}
</div>
