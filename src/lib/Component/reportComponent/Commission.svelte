<script lang="ts">
	import InfoBox from '../InfoBox.svelte';

	interface Props {
		net_total: number | null;
		commission: number | null;
	}

	let { net_total, commission }: Props = $props();
</script>

{#if net_total != -1 && net_total !== null && commission}
	<InfoBox title={'抽成' + commission + '%'} value={Math.floor(net_total * (commission / 100))}
	></InfoBox>
{/if}
