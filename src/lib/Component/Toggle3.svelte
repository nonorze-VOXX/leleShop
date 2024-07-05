<script lang="ts">
	export let choosing: number = 0;
	let checked: boolean[] = [false, false, false];
	let sr = true;
	const OnChange = (n: number) => {
		checked = [false, false, false];
		checked[n] = true;
		choosing = n;
	};

	$: {
		choosing;
		OnChange(choosing);
	}
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
			on:change={() => {
				choosing = 0;
			}}
			class:sr-only={sr}
		/>
	</label>
	<label class="inline-flex h-full w-1/3 cursor-pointer items-center bg-none">
		<input
			type="checkbox"
			bind:checked={checked[1]}
			on:change={() => {
				choosing = 1;
			}}
			class:sr-only={sr}
		/>
	</label>
	<label class="inline-flex h-full w-1/3 cursor-pointer items-center bg-none">
		<input
			type="checkbox"
			bind:checked={checked[2]}
			on:change={() => {
				choosing = 2;
			}}
			class:sr-only={sr}
		/>
	</label>
</div>
