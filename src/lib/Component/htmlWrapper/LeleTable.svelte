<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="max-h-screen w-full overflow-x-auto rounded-lg border-2 border-lele-line">
	<table class="relative w-full table-fixed text-left text-sm font-medium">
		{@render children?.()}
	</table>
</div>
