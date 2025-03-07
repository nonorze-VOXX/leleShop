<script lang="ts">
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	interface Props {
		label: string;
	}

	let { label }: Props = $props();
</script>

<button class="flex rounded-xl bg-lele-line p-2 font-semibold text-lele-bg" onclick={bubble('click')}>
	{label}
</button>
