<script lang="ts">
	export let text: string;
	export let choosing: boolean = true;
</script>

<button
	class:bg-lele-line={choosing}
	class:text-lele-bg={choosing}
	class:bg-lele-bg={!choosing}
	class:text-lele-line={!choosing}
	class:opacity-50={!choosing}
	on:click
	class="flex justify-between rounded-xl border-4 border-lele-line p-2 font-bold"
>
	{#if text === 'The創'}
		<p>The創 一中</p>
	{:else}
		<p>{text}</p>
	{/if}
</button>
