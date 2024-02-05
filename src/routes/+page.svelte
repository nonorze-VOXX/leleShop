<script lang="ts">
	import { onMount } from 'svelte';

	// let result: string[] = ['test'];
	let files: FileList;
</script>

<input type="file" bind:files id="fileInput" />
<div>
	{#if files}
		{#each Array.from(files) as file, i}
			<p>{file.name} {file.size} bytes</p>
			{#await file.text() then text}
				<p>e: {text} i: {i}</p>
			{/await}
		{/each}
	{/if}
</div>
