<script lang="ts">
	import { deserialize } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import db, { supabase } from '$lib/db';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	export let data: PageData;

	let login = false;
	let loginFailed = false;
	let user = null;
	async function LogoutSubmit(event: { currentTarget: EventTarget & HTMLFormElement }) {
		const data = new FormData(event.currentTarget);
		const response = await fetch(event.currentTarget.action, {
			method: 'POST',
			body: data
		});
		const result: ActionResult = deserialize(await response.text());
		if (result.type === 'success') {
			login = false;
			loginFailed = false;
		} else {
			console.log(result);
		}
		console.log(db.User);
	}
	onMount(async () => {
		console.log(db.User);
		login = data.logined;
	});
	async function LoginSubmit(event: { currentTarget: EventTarget & HTMLFormElement }) {
		const data = new FormData(event.currentTarget);

		const response = await fetch(event.currentTarget.action, {
			method: 'POST',
			body: data
		});
		const result: ActionResult = deserialize(await response.text());
		if (result.type === 'success') {
			login = true;
		} else {
			loginFailed = true;
		}
		console.log(db.User);
	}
</script>

{#if login}
	<h1>Page</h1>
	<div>
		<form action="?/logout" on:submit|preventDefault={LogoutSubmit}>
			<button type="submit">Logout</button>
		</form>
	</div>
	<div></div>
	<div></div>
{:else}
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
{/if}
