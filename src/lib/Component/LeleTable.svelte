<script lang="ts">
	export let tableData: string[][];
	export let buttonPart: {
		haveButton: boolean;
		buttonText: string;
		ButtonFunction: (value: string[]) => Promise<void>;
	} = {
		haveButton: false,
		buttonText: '',
		ButtonFunction: async (value: string[]) => {}
	};
</script>

{#if tableData && tableData.length > 0}
	<table class="min-w-full text-left text-base text-white font-medium">
		<thead class="border-b">
			<tr>
				{#each tableData[0] as cell}
					<td>
						{cell}
					</td>
				{/each}
			</tr>
		</thead>
		{#each tableData.slice(1) as table}
			<tbody>
				<tr
					class="border-b transition duration-300 ease-in-out hover:bg-neutral-100 dark:border-neutral-500 dark:hover:bg-neutral-600"
				>
					{#each table as cell}
						<td class="py-2 px-2">
							{cell}
						</td>
					{/each}
					{#if buttonPart.haveButton}
						<td class="py-2 px-2">
							<button
								class="bg-green-500 text-white rounded-md p-1"
								on:click={() => buttonPart.ButtonFunction(table)}
							>
								{buttonPart.buttonText}
							</button>
						</td>
					{/if}
				</tr>
			</tbody>
		{/each}
	</table>
{/if}
