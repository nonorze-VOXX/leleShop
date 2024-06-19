<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import SmallButton from './SmallButton.svelte';

	export let tabDataList: string[];
	export let showedMonth: string;
	export let shape: 'full' | 'up' | 'down' = 'up';
	let focus: boolean[] = [];
	$: {
		UpdateFocus();
	}
	function UpdateFocus() {
		focus = [];
		tabDataList.forEach((element) => {
			focus.push(element === showedMonth);
		});
		focus = focus;
	}
	const dispatch = createEventDispatcher<{
		onTabChange: { showedMonth: string };
	}>();
</script>

<div class="mx-2 flex justify-start overflow-auto">
	{#each tabDataList as tabData}
		<SmallButton
			bind:focus={focus[tabDataList.indexOf(tabData)]}
			bind:text={tabData}
			on:click={() => {
				showedMonth = tabData;
				dispatch('onTabChange', { showedMonth: tabData });
				UpdateFocus();
			}}
			{shape}
		></SmallButton>
	{/each}
</div>
