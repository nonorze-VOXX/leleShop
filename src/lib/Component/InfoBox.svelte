<script lang="ts">
	interface Props {
		title: string;
		value?: string | number;
	}

	let { title, value = '' }: Props = $props();
</script>

<div class="flex justify-between rounded-xl bg-lele-line p-2 text-lele-bg">
	<p class="inline">
		{title}
		{#if value !== ''}:
		{/if}
	</p>
	<p class="inline">{value}</p>
</div>
