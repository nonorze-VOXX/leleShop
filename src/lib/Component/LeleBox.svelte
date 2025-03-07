<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="overflow-hidden rounded-2xl border-4 border-lele-line">{@render children?.()}</div>
