<script lang="ts">
	export let net_total: number | null = null;
</script>

{#if net_total != -1}
	<div class="flex justify-between rounded-xl bg-lele-line p-2 text-lele-bg">
		<p class="inline">抽成10%:</p>
		<div>
			{#if net_total !== null}
				{Math.floor(net_total * 0.1)}
			{:else}
				計算中
			{/if}
		</div>
	</div>
{/if}
