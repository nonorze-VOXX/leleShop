<script lang="ts">
	import { supabase } from '$lib/db';
	import LeleBox from '$lib/Component/LeleBox.svelte';
	import { createEventDispatcher } from 'svelte';
	import { NextMonthFirstDate, ThisMonthFirstDate } from '$lib/function/Utils';

	export let artist_name: string;
	export let artist_id: string;
	let admit_fail = false;

	const dispatch = createEventDispatcher<{
		success: { firstDate: Date; lastDate: Date };
	}>();
	const SubmitKey = async (event: { currentTarget: EventTarget & HTMLFormElement }) => {
		const { data, error } = await supabase
			.from('artist')
			.select('report_key')
			.eq('id', artist_id)
			.eq('report_key', event.currentTarget.password.value);
		if (error || data.length === 0) {
			admit_fail = true;
			return;
		}
		const date = new Date();
		let firstDate: Date = ThisMonthFirstDate();
		let lastDate: Date = NextMonthFirstDate();
		dispatch('success', { firstDate, lastDate });
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
