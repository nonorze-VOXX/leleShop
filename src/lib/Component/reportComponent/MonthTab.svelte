<script lang="ts">
	import SmallButton from '../SmallButton.svelte';

	interface Props {
		tabDataList: string[];
		showedMonth: string;
		shape?: 'full' | 'up' | 'down';
		monthChange: (month: number) => void;
	}

	let { tabDataList, monthChange, showedMonth: initShowedMonth, shape = 'up' }: Props = $props();
	let nowShowedMonth = $state(initShowedMonth);
</script>

<div class="mx-2 flex justify-start overflow-auto">
	{#each tabDataList as tabData}
		<SmallButton
			focus={nowShowedMonth === tabData}
			text={tabData}
			onclick={() => {
				nowShowedMonth = tabData;
				monthChange(parseInt(nowShowedMonth));
			}}
			{shape}
		></SmallButton>
	{/each}
</div>
