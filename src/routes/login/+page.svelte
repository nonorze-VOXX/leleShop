<script lang="ts">
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/db';

	let loginFailed = $state(false);
	async function LoginSubmit(
		event: SubmitEvent & {
			currentTarget: EventTarget & HTMLFormElement;
		}
	) {
		event.preventDefault();
		const email = event.currentTarget.email.value;
		const password = event.currentTarget.password.value;
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password
		});
		if (error) {
			loginFailed = true;
			return;
		}
		goto('/lele', { replaceState: true });
	}
</script>

<div class="flex h-screen flex-col justify-center">
	<div class="flex justify-center">
		<div class="flex flex-col items-center rounded-xl bg-white p-5">
			<form
				action="?/login"
				onsubmit={LoginSubmit}
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
