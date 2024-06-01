<script lang="ts">
	export let net_total: number | null;
</script>

<div class="flex justify-between rounded-xl bg-lele-line p-2 text-lele-bg">
	<p class="inline">匯款金額：</p>
	<div>
		{#if net_total != null}
			{Math.floor(net_total * 0.9)}
		{:else}
			計算中
		{/if}
	</div>
</div>
