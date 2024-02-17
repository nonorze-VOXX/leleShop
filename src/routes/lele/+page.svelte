<script lang="ts">
	import { deserialize } from '$app/forms';
	import { invalidate, invalidateAll } from '$app/navigation';
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

<div>
	<form action="?/logout" on:submit|preventDefault={LogoutSubmit}>
		<button type="submit">Logout</button>
	</form>
</div>
