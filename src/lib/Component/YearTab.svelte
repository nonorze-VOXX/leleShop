<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import SmallButton from './SmallButton.svelte';
	import MidButton from './MidButton.svelte';

	export let yearRange: { min: number; max: number };
	export let showedYear: string;
	export let shape: 'full' | 'up' | 'down' = 'up';
	let focus: boolean[] = [];
	let tabDataList: string[] = [];

	$: {
		tabDataList = Array.from({ length: yearRange.max - yearRange.min + 1 }, (_, i) =>
			(yearRange.min + i).toString()
		);
		UpdateFocus();
	}

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
</script>

<div class="m-2 flex justify-start overflow-auto">
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
