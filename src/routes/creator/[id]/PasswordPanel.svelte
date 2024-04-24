<script lang="ts">
	import type { PageData } from './$types';
	import type { ActionResult } from '@sveltejs/kit';
	import { deserialize } from '$app/forms';
	import type { QueryTradeBodyWithTradeHead } from '$lib/db';
	import LeleBox from '$lib/Component/LeleBox.svelte';
	import { createEventDispatcher } from 'svelte';

	export let artist_name: string;
	export let artist_id: string;
	let admit_fail = false;

	const dispatch = createEventDispatcher<{
		success: { firstDate: Date; lastDate: Date };
	}>();
	const SubmitKey = async (event: { currentTarget: EventTarget & HTMLFormElement }) => {
		const data = new FormData(event.currentTarget);
		data.append('id', artist_id);
		const date = new Date();
		let firstDate: Date = new Date(date.getFullYear(), date.getMonth() - 1, 1);
		let lastDate: Date = new Date(date.getFullYear(), date.getMonth(), 1);

		const response = await fetch(event.currentTarget.action, {
			method: 'POST',
			body: data
		});
		const result: ActionResult = deserialize(await response.text());
		if (result.type === 'success') {
			dispatch('success', { firstDate, lastDate });
		} else {
			admit_fail = true;
		}
	};
</script>

<h1 class="p-5 text-center text-3xl font-bold">{artist_name}</h1>
<form action="?/VerifyPassword" on:submit|preventDefault={SubmitKey} class="flex flex-col">
	<div class="flex">
		<input type="password" id="password" name="password" required />

		<LeleBox>
			<button type="submit" class="h-full w-full bg-lele-line px-2 font-bold text-lele-bg"
				>submit</button
			>
		</LeleBox>
	</div>
	{#if admit_fail}
		<div>Password wrong</div>
	{/if}
</form>
