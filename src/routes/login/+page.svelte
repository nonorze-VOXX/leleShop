<script lang="ts">
	import { supabase } from '$lib/db';

	async function Login() {
		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${window.location.origin}/lele`
			}
		});
		if (error) {
			console.error(error);
		}
	}
</script>

<div class="flex h-screen flex-col justify-center">
	<div class="flex justify-center">
		<div class="flex flex-col items-center rounded-xl bg-white p-5">
			<button class="rounded-full bg-green-600 px-3 py-2 font-bold text-white" on:click={Login}>
				Sign in with Google
			</button>
		</div>
	</div>
</div>
