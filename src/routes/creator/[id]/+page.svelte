<script lang="ts">
	import DownloadButton from './DownloadButton.svelte';

	import MonthTabReportTableWithLogic from '$lib/Component/MonthTabReportTableWithLogic.svelte';

	import PasswordPanel from './PasswordPanel.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { supabase } from '$lib/db';
	import { page } from '$app/stores';
	import TradeCount from '$lib/Component/reportComponent/TradeCount.svelte';
	import InfoBox from '$lib/Component/InfoBox.svelte';
	import { selectedStore } from '$lib/store/choosing';
	import { browser } from '$app/environment';
	import { FormatNumberToTwoDigi } from '$lib/function/Utils';
	import RemitAndCommission from '$lib/Component/reportComponent/RemitAndCommission.svelte';

	enum PasswordPanelState {
		Loading,
		NotAdmit,
		Admit
	}
	let artist_name: string = $state('');
	let net_total = $state(-1);
	let artist_id: number = $state(0);
	let panelState: PasswordPanelState = $state(PasswordPanelState.Loading);
	let showedLength = $state(0);
	let logText: string = $state('');

	let firstDate: Date | null = $state();
	let lastDate: Date | null = $state();
	const PageQueryData = async () => {
		artist_id = Number($page.params.id);
		if (isNaN(artist_id)) {
			logText = 'artist_id is not a number';
			return;
		}
		{
			const { data, error } = await supabase
				.from('artist')
				.select('artist_name')
				.eq('id', artist_id)
				.single();

			if (error) {
				logText = error.message;
				return;
			}

			artist_name = data.artist_name;
		}
	};
	onMount(() => {
		panelState = PasswordPanelState.NotAdmit;
	}); // use selectedStore will init
	const unsubscribe = selectedStore.subscribe(async (e) => {
		if (browser) {
			await PageQueryData();
		}
	});

	onDestroy(unsubscribe);
	let year_month: string | null = $state(null);
</script>

<div class="flex flex-col items-center gap-3">
	<div>{logText}</div>

	{#if panelState === PasswordPanelState.Loading}
		<div class="flex h-screen items-center justify-center">
			<div class="h-32 w-32 animate-spin rounded-full border-b-2 border-l-2 border-lele-line"></div>
		</div>
	{:else if panelState === PasswordPanelState.NotAdmit}
		<div class="flex flex-wrap gap-2 text-2xl font-bold">
			<InfoBox title={artist_name}></InfoBox>
		</div>
		<PasswordPanel
			bind:artist_id
			on:success={() => {
				panelState = PasswordPanelState.Admit;
			}}
		></PasswordPanel>
	{:else if panelState === PasswordPanelState.Admit}
		<div class="flex flex-wrap justify-center gap-4 text-center text-sm font-semibold">
			<InfoBox title={artist_name}></InfoBox>
			<TradeCount bind:showedLength></TradeCount>
			{#if year_month}
				<RemitAndCommission bind:net_total bind:artist_id bind:year_month></RemitAndCommission>
			{/if}

			<DownloadButton bind:firstDate bind:lastDate bind:artist_id></DownloadButton>
		</div>
		<MonthTabReportTableWithLogic
			bind:artist_id
			on:change={(e) => {
				net_total = e.detail.net_total;
				firstDate = e.detail.firstDate;
				lastDate = e.detail.lastDate;
				showedLength = e.detail.showedLength;
				// todo: make no need to refresh to get year_month
				year_month =
					firstDate?.getFullYear().toString() +
					'-' +
					FormatNumberToTwoDigi((firstDate?.getMonth() + 1).toString());
			}}
		></MonthTabReportTableWithLogic>
	{/if}
</div>
