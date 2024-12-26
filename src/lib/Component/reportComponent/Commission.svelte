<script lang="ts">
	import { browser } from '$app/environment';
	import { supabase } from '$lib/db';
	import { selectedStore } from '$lib/store/choosing';
	import { onDestroy } from 'svelte';
	import InfoBox from '../InfoBox.svelte';

	export let net_total: number | null;
	export let commission: number | null;
</script>

{#if net_total != -1 && net_total !== null && commission}
	<InfoBox title={'抽成' + commission + '%'} value={Math.floor(net_total * (commission / 100))}
	></InfoBox>
{/if}
