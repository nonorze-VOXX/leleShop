<script lang="ts">
	import { deserialize } from '$app/forms';
	import { invalidate, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import type { ActionResult } from '@sveltejs/kit';

	async function LogoutSubmit(event: { currentTarget: EventTarget & HTMLFormElement }) {
		const data = new FormData(event.currentTarget);
		const response = await fetch(event.currentTarget.action, {
			method: 'POST',
			body: data
		});
		const result: ActionResult = deserialize(await response.text());
		if (result.type === 'success') {
			invalidateAll();
		} else {
			console.log(result);
		}
	}
</script>

{#if $page.url.pathname !== '/lele/login'}
	<div class="flex justify-center border-b-2 border-red-800 bg-gray-400">
		<div class="flex justify-between w-full">
			<div></div>
			<div class="flex justify-end">
				<div class="rounded-xl bg-red-800 text-white px-3 font-semibold m-2">
					<form action="/lele?/logout" on:submit|preventDefault={LogoutSubmit}>
						<button type="submit">Logout</button>
					</form>
				</div>
			</div>
		</div>
	</div>
{/if}
<slot />
