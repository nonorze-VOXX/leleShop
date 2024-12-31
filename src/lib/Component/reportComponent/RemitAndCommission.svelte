<script lang="ts">
	import { browser } from '$app/environment';
	import { supabase } from '$lib/db';
	import { selectedStore } from '$lib/store/choosing';
	import { onDestroy, onMount } from 'svelte';

	import Remit from './Remit.svelte';
	import Commission from './Commission.svelte';

	export let net_total: number | null;
	export let artist_id: number;
	export let year_month: string;
	let commission: number | null = null;

	const fetchCommission = async () => {
		if (browser) {
			if ($selectedStore !== '*' && $selectedStore.length === 1) {
				const { data, error } = await supabase
					.from('default_commission_view')
					.select('*')
					.eq('store_name', $selectedStore[0])
					.eq('artist_id', artist_id)
					.eq('year_month', year_month);
				if (error) {
					// console.error(error);
					commission = null;
					return;
				}
				if (data.length === 1) commission = data[0].commission;
				else commission = 10; // default commission
			} else {
				commission = null;
			}
		}
	};

	const unsubscribe = selectedStore.subscribe(fetchCommission);

	onMount(fetchCommission);

	$: year_month, fetchCommission();
	$: net_total, fetchCommission();

	onDestroy(unsubscribe);
</script>

<Commission {net_total} {commission} />
<Remit {net_total} {commission} />
