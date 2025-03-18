<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<thead class="sticky top-0 z-40 bg-lele-line text-sm font-semibold text-lele-bg shadow-lg">
	{@render children?.()}
</thead>
