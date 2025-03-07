<script lang="ts">
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	interface Props {
		focus: boolean;
		text: string;
		shape: 'full' | 'up' | 'down';
	}

	let { focus, text, shape }: Props = $props();
</script>

<div
	class:bg-lele-bg={!focus}
	class:text-lele-line={!focus}
	class:bg-lele-line={focus}
	class:text-lele-bg={focus}
	class:rounded-t-xl={shape === 'up'}
	class:rounded-b-xl={shape === 'down'}
	class:rounded-xl={shape === 'full'}
	class:border-t-4={shape === 'full' || shape === 'up'}
	class:border-b-4={shape === 'full' || shape === 'down'}
	class=" border-l-4 border-r-4 border-lele-line font-semibold"
>
	<button onclick={bubble('click')} class="w-12">
		{text}
	</button>
</div>
