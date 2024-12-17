<script lang="ts">
	import InfoBox from '../InfoBox.svelte';

	export let net_total: number | null = null;
</script>

{#if net_total != -1 && net_total !== null}
	<InfoBox title="抽成10%" value={Math.floor(net_total * 0.1)}></InfoBox>
{/if}
