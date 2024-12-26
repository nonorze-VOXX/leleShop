<script lang="ts">
	import { browser } from '$app/environment';
	import { supabase } from '$lib/db';
	import { selectedStore } from '$lib/store/choosing';
	import { onDestroy } from 'svelte';
	import Remit from './Remit.svelte';
	import Commission from './Commission.svelte';

	export let net_total: number | null;
	export let artist_id: number;
	export let year_month: string;
	let commission: number | null = null;

	const unsubscribe = selectedStore.subscribe(async (e) => {
		if (browser) {
			if (e !== '*' && e.length === 1) {
				const { data, error } = await supabase
					.from('default_commission_view')
					.select('*')
					.eq('store_name', e[0])
					.eq('artist_id', artist_id)
					.eq('year_month', year_month)
					.single();
				if (error) {
					console.error(error);
					commission = null;
					return;
				}
				commission = data.commission;
			} else {
				commission = null;
			}
		}
	});

	onDestroy(unsubscribe);
</script>

<Commission {net_total} {commission} />
<Remit {net_total} {commission} />
