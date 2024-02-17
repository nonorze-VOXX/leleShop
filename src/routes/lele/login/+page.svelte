<script lang="ts">
	import { deserialize } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	export let data: PageData;

	let loginFailed = false;
	async function LoginSubmit(event: { currentTarget: EventTarget & HTMLFormElement }) {
		const data = new FormData(event.currentTarget);

		const response = await fetch(event.currentTarget.action, {
			method: 'POST',
			body: data
		});
		const result: ActionResult = deserialize(await response.text());
		if (result.type === 'success') {
			invalidateAll();
		} else {
			loginFailed = true;
		}
	}
</script>

<div class="flex flex-col justify-center h-screen">
	<div class="flex justify-center">
		<div class="flex flex-col rounded-xl bg-white items-center p-5">
			<form
				action="?/login"
				on:submit|preventDefault={LoginSubmit}
				class="flex flex-col gap-4 items-center text-lg"
			>
				<div class="w-full flex gap-3 justify-between items-center">
					<label for="email">Email</label>
					<input
						type="email"
						id="email"
						name="email"
						class="grow rounded-lg p-2 bg-gray-50 border border-gray-300"
						placeholder="example@mail.com"
						required
					/>
				</div>
				<div class="w-full flex gap-3 justify-between items-center">
					<label for="password">password</label>
					<input
						type="password"
						id="password"
						class="grow rounded-lg p-2 bg-gray-50 border border-gray-300"
						name="password"
						required
					/>
				</div>
				{#if loginFailed}
					<div class="text-xl text-red-700 text-center">Login fail</div>
				{/if}

				<button class="rounded-full px-3 bg-green-600 w-fit text-white font-bold" type="submit"
					>Submit</button
				>
			</form>
		</div>
	</div>
</div>
