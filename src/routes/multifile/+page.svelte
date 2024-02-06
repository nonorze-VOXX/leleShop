<script lang="ts">
	import { enhance } from '$app/forms';
	import { applyAction, deserialize } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { ActionResult } from '@sveltejs/kit';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let error: any;

	let final: string[][];
	async function handleSubmit(event: { currentTarget: EventTarget & HTMLFormElement }) {
		const data = new FormData(event.currentTarget);

		const response = await fetch(event.currentTarget.action, {
			method: 'POST',
			body: data
		});

		const result: ActionResult = deserialize(await response.text());
		console.log(result);

		if (result.type === 'success') {
			// rerun all `load` functions, following the successful update
			final = result.data as unknown as string[][];
			await invalidateAll();
		}

		applyAction(result);
	}
</script>

<form
	method="post"
	use:enhance
	on:submit|preventDefault={handleSubmit}
	enctype="multipart/form-data"
>
	<div class="group">
		<label for="file">Upload your file</label>
		<input multiple type="file" id="file" name="fileToUpload" accept=".csv" required />
	</div>

	<button class="" type="submit">Submit</button>
</form>

{#if final && final.length > 0}
	<!-- <table class="table-auto text-white"> -->
	<table class="min-w-full text-left text-base text-white font-medium">
		<thead class="border-b">
			<tr>
				{#each final[0] as cell}
					<td>
						{cell}
					</td>
				{/each}
			</tr>
		</thead>
		{#each final.slice(1) as table}
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
