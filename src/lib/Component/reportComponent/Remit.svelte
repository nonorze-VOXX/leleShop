<script lang="ts">
	import { browser } from '$app/environment';
	import { supabase } from '$lib/db';
	import { selectedStore } from '$lib/store/choosing';
	import { onDestroy } from 'svelte';
	import InfoBox from '../InfoBox.svelte';

	export let net_total: number | null;
	let commision: number | null = null;

	const unsubscribe = selectedStore.subscribe(async (e) => {
		if (browser) {
			if (e !== '*' && e.length === 1) {
				const { data, error } = await supabase
					.from('store')
					.select('*')
					.eq('store_name', e[0])
					.single();
				if (error) {
					console.log(error);
					commision = null;
					return;
				}
				commision = data.commision;
			} else {
				commision = null;
			}
		}
	});

	onDestroy(unsubscribe);
</script>

{#if net_total != -1 && net_total !== null}
	{#if commision}
		<InfoBox title="匯款金額" value={Math.ceil(net_total * ((100 - commision) / 100))}></InfoBox>
	{:else}
		<!-- <InfoBox title="匯款金額" value={'only support one store for this'}></InfoBox> -->
	{/if}
{:else}
	<InfoBox title="匯款金額" value={'計算中'}></InfoBox>
{/if}
