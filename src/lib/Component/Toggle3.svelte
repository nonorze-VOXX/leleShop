<script lang="ts">
	import { run } from 'svelte/legacy';

	import { createEventDispatcher } from 'svelte';

	interface Props {
		choosing?: number;
	}

	let { choosing = $bindable(0) }: Props = $props();
	let checked: boolean[] = $state([false, false, false]);
	let sr = true;
	const OnChange = (n: number) => {
		checked = [false, false, false];
		checked[n] = true;
		choosing = n;
	};
	const dispatch = createEventDispatcher<{
		change: { choosing: number };
	}>();

	run(() => {
		choosing = choosing > 2 ? 2 : choosing < 0 ? 0 : choosing;
		OnChange(choosing);
		dispatch('change', { choosing });
	});
</script>

<div
	class:before:translate-x-full={checked[1]}
	class:before:translate-x-10={checked[2]}
	class="
		 relative z-10 inline-flex h-6
		 w-16
		cursor-pointer
		items-center
		rounded-full
		bg-lele-line

		before:absolute
		before:start-[2px]
		before:top-[2px]
		before:h-5
		before:w-5
		before:rounded-full
		before:bg-lele-bg
		before:transition
		 "
>
	<label class=" inline-flex h-full w-1/3 cursor-pointer items-center bg-none">
		<input
			type="checkbox"
			bind:checked={checked[0]}
			onchange={() => {
				choosing = 0;
			}}
			class:sr-only={sr}
		/>
	</label>
	<label class="inline-flex h-full w-1/3 cursor-pointer items-center bg-none">
		<input
			type="checkbox"
			bind:checked={checked[1]}
			onchange={() => {
				choosing = 1;
			}}
			class:sr-only={sr}
		/>
	</label>
	<label class="inline-flex h-full w-1/3 cursor-pointer items-center bg-none">
		<input
			type="checkbox"
			bind:checked={checked[2]}
			onchange={() => {
				choosing = 2;
			}}
			class:sr-only={sr}
		/>
	</label>
</div>
