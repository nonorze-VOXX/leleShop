<script lang="ts">
	import { FormatNumberToTwoDigi } from '$lib/function/Utils';
	import SmallButton from '../SmallButton.svelte';

	interface Props {
		tabDataList: string[];
		initShowedMonth: string;
		shape?: 'full' | 'up' | 'down';
		monthChange: (month: number) => void;
	}

	let { tabDataList, monthChange, initShowedMonth, shape = 'up' }: Props = $props();
	let nowShowedMonth = $state(FormatNumberToTwoDigi(initShowedMonth));
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
