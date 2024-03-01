<script lang="ts">
	export let tableHead: string[];
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
	<div class="w-full overflow-hidden rounded-lg border-2 border-lele-line">
		<table class="w-full min-w-fit table-auto text-left text-base font-medium">
			<thead class="border-b border-lele-line">
				<tr>
					{#each tableHead as cell}
						<td class="p-2 text-center text-lg font-semibold">
							{cell}
						</td>
					{/each}
				</tr>
			</thead>
			{#each tableData as table}
				<tbody>
					<tr
						class=" border-b transition duration-300 ease-in-out hover:bg-neutral-100 dark:border-neutral-500 dark:hover:bg-neutral-300"
					>
						{#each table as cell}
							<td class="px-2 py-2">
								{cell}
							</td>
						{/each}
						{#if buttonPart.haveButton}
							<td class="px-2 py-2">
								<button
									class="w-full rounded-md bg-green-500 p-1 text-white"
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
	</div>
{/if}
