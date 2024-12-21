<script lang="ts">
	export let text: string;
	export let choosing: boolean = true;
</script>

<button
	class:bg-lele-line={choosing}
	class:text-lele-bg={choosing}
	class:bg-lele-bg={!choosing}
	class:text-lele-line={!choosing}
	on:click
	class="flex justify-between rounded-xl border-4 border-lele-line p-2 font-bold"
>
	<p>{text}</p>
</button>
