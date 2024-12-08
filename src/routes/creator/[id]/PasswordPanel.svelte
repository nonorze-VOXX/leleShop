<script lang="ts">
	import { supabase } from '$lib/db';
	import LeleBox from '$lib/Component/LeleBox.svelte';
	import { createEventDispatcher } from 'svelte';

	export let artist_id: string;
	let admit_fail = false;

	const dispatch = createEventDispatcher<{
		success: {};
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
		dispatch('success', {});
	};
</script>

<form on:submit|preventDefault={SubmitKey} class="flex flex-col">
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
