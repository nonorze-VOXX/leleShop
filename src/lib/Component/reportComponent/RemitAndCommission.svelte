<script lang="ts">
	import { run } from 'svelte/legacy';

	import { browser } from '$app/environment';
	import { supabase } from '$lib/db';
	import { selectedStore } from '$lib/store/choosing';
	import { onDestroy, onMount } from 'svelte';

	import Remit from './Remit.svelte';
	import Commission from './Commission.svelte';

	interface Props {
		net_total: number | null;
		artist_id: number;
		year_month: string;
	}

	let { net_total, artist_id, year_month }: Props = $props();
	let commission: number | null = $state(null);

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
	onDestroy(unsubscribe);
</script>

<Commission {net_total} {commission} />
<Remit {net_total} {commission} />
