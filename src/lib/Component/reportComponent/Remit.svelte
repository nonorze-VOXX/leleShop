<script lang="ts">
	import InfoBox from '../InfoBox.svelte';

	interface Props {
		net_total: number | null;
		commission: number | null;
	}

	let { net_total, commission }: Props = $props();
</script>

{#if net_total != -1 && net_total !== null}
	{#if commission !== null}
		<InfoBox title="匯款金額" value={Math.ceil(net_total * ((100 - commission) / 100))}></InfoBox>
	{:else}
		<!-- <InfoBox title="匯款金額" value={'only support one store for this'}></InfoBox> -->
	{/if}
{:else}
	<InfoBox title="匯款金額" value={'計算中'}></InfoBox>
{/if}
