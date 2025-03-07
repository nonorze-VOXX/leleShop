<script lang="ts">
	import { run } from 'svelte/legacy';

	import { createEventDispatcher } from 'svelte';
	import MidButton from '../MidButton.svelte';

	interface Props {
		yearRange: { min: number; max: number };
		showedYear: string;
		shape?: 'full' | 'up' | 'down';
	}

	let { yearRange, showedYear = $bindable(), shape = 'up' }: Props = $props();
	let focus: boolean[] = $state([]);
	let tabDataList: string[] = $state([]);


	function UpdateFocus() {
		focus = [];
		tabDataList.forEach((element) => {
			focus.push(element === showedYear);
		});
		focus = focus;
	}

	const dispatch = createEventDispatcher<{
		onTabChange: { showedYear: string };
	}>();
	run(() => {
		tabDataList = Array.from({ length: yearRange.max - yearRange.min + 1 }, (_, i) =>
			(yearRange.min + i).toString()
		);
		UpdateFocus();
	});
</script>

<div class="m-2 flex justify-start gap-2 overflow-auto">
	{#each tabDataList as tabData}
		<MidButton
			bind:focus={focus[tabDataList.indexOf(tabData)]}
			bind:text={tabData}
			on:click={() => {
				showedYear = tabData;
				dispatch('onTabChange', { showedYear: tabData });
				UpdateFocus();
			}}
			{shape}
		></MidButton>
	{/each}
</div>
