<script lang="ts">
	import MidButton from '../MidButton.svelte';

	interface Props {
		yearRange: { min: number; max: number };
		showedYear: string;
		shape?: 'full' | 'up' | 'down';
		yearChange: (year: number) => void;
	}

	let { yearChange, yearRange, showedYear: initYear, shape = 'up' }: Props = $props();
	let showedYear = $state(initYear);
	let tabDataList: string[] = $derived(
		Array.from({ length: yearRange.max - yearRange.min + 1 }, (_, i) =>
			(yearRange.min + i).toString()
		)
	);
</script>

<div class="m-2 flex justify-start gap-2 overflow-auto">
	{#each tabDataList as tabData}
		<MidButton
			focus={tabData === showedYear}
			text={tabData}
			onclick={() => {
				showedYear = tabData;
				yearChange(parseInt(showedYear));
				// UpdateFocus();
			}}
			{shape}
		></MidButton>
	{/each}
</div>
