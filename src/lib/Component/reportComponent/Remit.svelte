<script lang="ts">
	export let net_total: number | null;
	export let commission: number | null;
</script>

<div class="flex justify-between rounded-xl bg-lele-line p-2 text-lele-bg">
	<p class="inline">匯款金額：</p>
	<div>
		{#if commission != null}
			{#if net_total != null}
				{Math.ceil(net_total * (1 - commission / 100))}
			{:else}
				計算中
			{/if}
		{:else}
			shop!!
		{/if}
	</div>
</div>
