<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<tbody class="overflow-y-auto">
	{@render children?.()}
</tbody>
