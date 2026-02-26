<script lang="ts">
	import { browser } from '$app/environment';
	import { supabase } from '$lib/db';
	import { selectedStore, type StoreList } from '$lib/store/choosing';

	import Remit from './Remit.svelte';
	import Commission from './Commission.svelte';

	interface Props {
		net_total: number | null;
		artist_id: number;
		year_month: string;
	}

	let { net_total, artist_id, year_month }: Props = $props();
	let commission: number | null = $state(null);

	$effect(() => {
		const load = async () => {
			let e = $selectedStore;
			if (browser) {
				if (e !== '*' && e.length === 1) {
					const { data, error } = await supabase
						.from('default_commission_view')
						.select('*')
						.eq('store_name', e[0])
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

		load();
	});
</script>

<Commission {net_total} {commission} />
<Remit {net_total} {commission} />
