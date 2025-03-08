<script lang="ts">
	import { run } from 'svelte/legacy';

	import { createEventDispatcher } from 'svelte';
	import SmallButton from '../SmallButton.svelte';

	interface Props {
		tabDataList: string[];
		showedMonth: string;
		shape?: 'full' | 'up' | 'down';
	}

	let { tabDataList, showedMonth = $bindable(), shape = 'up' }: Props = $props();
	let focus: boolean[] = $state([]);
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
	run(() => {
		// force tracking
		tabDataList;
		UpdateFocus();
	});
</script>

<div class="mx-2 flex justify-start overflow-auto">
	{#each tabDataList as tabData}
		<SmallButton
			focus={focus[tabDataList.indexOf(tabData)]}
			text={tabData}
			onclick={() => {
				showedMonth = tabData;
				dispatch('onTabChange', { showedMonth: tabData });
				UpdateFocus();
			}}
			{shape}
		></SmallButton>
	{/each}
</div>
