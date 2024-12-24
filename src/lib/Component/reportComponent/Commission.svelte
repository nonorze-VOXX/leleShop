<script lang="ts">
	import { browser } from '$app/environment';
	import { supabase } from '$lib/db';
	import { selectedStore } from '$lib/store/choosing';
	import { onDestroy } from 'svelte';
	import InfoBox from '../InfoBox.svelte';

	export let net_total: number | null = null;

	let commission: number | null = null;

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
					commission = null;
					return;
				}
				commission = data.default_commission;
			} else {
				commission = null;
			}
		}
	});

	onDestroy(unsubscribe);
</script>

{#if net_total != -1 && net_total !== null && commission}
	<InfoBox title={'抽成' + commission + '%'} value={Math.floor(net_total * (commission / 100))}
	></InfoBox>
{/if}
