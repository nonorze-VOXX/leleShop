<script lang="ts">
	import InfoBox from '../InfoBox.svelte';

	export let net_total: number | null;
</script>

{#if net_total != -1 && net_total !== null}
	<InfoBox title="匯款金額" value={Math.ceil(net_total * 0.9)}></InfoBox>
{:else}
	<InfoBox title="匯款金額" value={'計算中'}></InfoBox>
{/if}
