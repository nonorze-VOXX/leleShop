<script lang="ts">
	import DownloadButton from './DownloadButton.svelte';

	import MonthTabReportTableWithLogic1 from '$lib/Component/MonthTabReportTableWithLogic.svelte';

	import PasswordPanel from './PasswordPanel.svelte';
	import { onMount } from 'svelte';
	import db, { type ShopRow } from '$lib/db';
	import { page } from '$app/stores';
	import TradeCount from '$lib/Component/reportComponent/TradeCount.svelte';
	import Commision from '$lib/Component/reportComponent/Commision.svelte';
	import Remit from '$lib/Component/reportComponent/Remit.svelte';
	import { goto } from '$app/navigation';

	let artist_name: string = '';
	let net_total = -1;
	let artist_id: string = '';
	let admit = false;
	let showedLength = 0;
	let shop_id: number | null | '*' = '*';
	let shopList: ShopRow[] = [];

	onMount(async () => {
		artist_id = $page.params.id;
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
	let firstDate: Date | null;
	let lastDate: Date | null;

	async function handleShopChange(event: { currentTarget: EventTarget & HTMLFormElement }) {
		const formData = new FormData(event.currentTarget);
		const param = new URLSearchParams($page.url.searchParams);
		param.set('shop_id', formData.get('shops') as string);
		goto(`?${param.toString()}`);
	}
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

			<DownloadButton bind:firstDate bind:lastDate bind:artist_id></DownloadButton>
		</div>
		{#if shop_id}
			<MonthTabReportTableWithLogic1
				bind:shop_id
				bind:artist_id
				on:change={(e) => {
					net_total = e.detail.net_total;
					firstDate = e.detail.firstDate;
					lastDate = e.detail.lastDate;
					showedLength = e.detail.showedLength;
				}}
			></MonthTabReportTableWithLogic1>
		{/if}
	{/if}
</div>
