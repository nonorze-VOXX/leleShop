<script lang="ts">
	import type { ShopRow } from '$lib/db';

	export let net_total: number | null = null;
	export let shopRow: ShopRow | null = null;
</script>

{#if net_total != -1}
	<div class="flex justify-between rounded-xl bg-lele-line p-2 text-lele-bg">
		{#if shopRow}
			<p class="inline">抽成{shopRow.commission}%:</p>
		{:else}
			<p class="inline">抽成??%:</p>
		{/if}
		<div>
			{#if net_total !== null}
				{Math.floor(net_total * 0.1)}
			{:else}
				計算中
			{/if}
		</div>
	</div>
{/if}
