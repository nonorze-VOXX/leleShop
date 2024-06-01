<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let tabDataList: string[];
	export let showedMonth: string;
	const dispatch = createEventDispatcher<{
		onTabChange: { showedMonth: string };
	}>();
</script>

<div class="mx-2 flex justify-start overflow-auto">
	{#each tabDataList as tabData}
		<div
			class:bg-lele-bg={showedMonth !== tabData}
			class:text-lele-line={showedMonth !== tabData}
			class:bg-lele-line={showedMonth === tabData}
			class:text-lele-bg={showedMonth === tabData}
			class="rounded-t-xl border-l-4 border-r-4 border-t-4 border-lele-line px-1 font-semibold"
		>
			<button
				on:click={() => {
					dispatch('onTabChange', { showedMonth: tabData });
				}}
			>
				{tabData}
			</button>
		</div>
	{/each}
</div>
