<script lang="ts">
	import { supabase } from '$lib/db';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	export let redirect: string = '/login';

	onMount(async () => {
		const access_token = (await supabase.auth.getSession()).data.session?.access_token;
		if (access_token === undefined || access_token === '') {
			console.log('access token ', access_token);
			goto(redirect, { replaceState: true });
		}
	});

	async function LogoutSubmit() {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error(error);
		} else {
			console.log('succ');
			goto('/');
		}
	}
</script>

<div class="flex justify-center border-b-2 border-lele-line">
	<div class="flex w-full justify-between">
		<div></div>
		<div class="flex justify-end">
			<div class="m-2 rounded-xl bg-red-600 px-3 font-semibold text-white">
				<form action="/login?/logout" on:submit|preventDefault={LogoutSubmit}>
					<button type="submit">Logout</button>
				</form>
			</div>
		</div>
	</div>
</div>
<slot />
