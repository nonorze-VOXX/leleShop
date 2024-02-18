<script lang="ts">
	export let tableData: string[][];
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
				</tr>
			</tbody>
		{/each}
	</table>
{/if}
