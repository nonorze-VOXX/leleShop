<script lang="ts">
	import { deserialize } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import type { PageData } from './$types';
	import { goto, invalidateAll } from '$app/navigation';
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
			goto('/lele');
		} else {
			loginFailed = true;
		}
	}
</script>

<div class="flex h-screen flex-col justify-center">
	<div class="flex justify-center">
		<div class="flex flex-col items-center rounded-xl bg-white p-5">
			<form
				action="?/login"
				on:submit|preventDefault={LoginSubmit}
				class="flex flex-col items-center gap-4 text-lg"
			>
				<div class="flex w-full items-center justify-between gap-3">
					<label for="email">Email</label>
					<input
						type="email"
						id="email"
						name="email"
						class="grow rounded-lg border border-gray-300 bg-gray-50 p-2"
						placeholder="example@mail.com"
						required
					/>
				</div>
				<div class="flex w-full items-center justify-between gap-3">
					<label for="password">password</label>
					<input
						type="password"
						id="password"
						class="grow rounded-lg border border-gray-300 bg-gray-50 p-2"
						name="password"
						required
					/>
				</div>
				{#if loginFailed}
					<div class="text-center text-xl text-red-700">Login fail</div>
				{/if}

				<button class="w-fit rounded-full bg-green-600 px-3 font-bold text-white" type="submit"
					>Submit</button
				>
			</form>
		</div>
	</div>
</div>
