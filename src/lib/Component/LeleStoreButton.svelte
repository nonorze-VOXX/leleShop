<script lang="ts">
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	interface Props {
		text: string;
		choosing?: boolean;
	}

	let { text, choosing = true }: Props = $props();
</script>

<button
	class:bg-lele-line={choosing}
	class:text-lele-bg={choosing}
	class:bg-lele-bg={!choosing}
	class:text-lele-line={!choosing}
	class:opacity-50={!choosing}
	onclick={bubble('click')}
	class="flex justify-between rounded-xl border-4 border-lele-line p-2 font-bold"
>
	{#if text === 'The創'}
		<p>The創 一中</p>
	{:else}
		<p>{text}</p>
	{/if}
</button>
