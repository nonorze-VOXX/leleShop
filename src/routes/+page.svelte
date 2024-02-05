<script lang="ts">
	let files: FileList;
</script>

<input type="file" bind:files id="fileInput" />

<table class="flex flex-col table-auto">
	{#if files}
		{#each Array.from(files) as file, i}
			{#await file.text() then text}
				<thead>
					{#each text[0].split('\n') as line}
						<tr>
							{#each line.split(',') as word}
								<th>
									<p>{word}</p>
								</th>
							{/each}
						</tr>
					{/each}
				</thead>
				<tbody>
					{#each text.split('\n') as line}
						<tr>
							{#each line.split(',') as word}
								<th>
									<p>{word}</p>
								</th>
							{/each}
						</tr>
					{/each}
				</tbody>
			{/await}
		{/each}
	{/if}
</table>
