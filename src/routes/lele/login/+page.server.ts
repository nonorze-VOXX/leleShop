import { supabase } from '$lib/db';
import { fail } from '@sveltejs/kit';

export const actions = {
	login: async ({ request }) => {
		const formData = await request.formData();

		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const { error } = await supabase.auth.signInWithPassword({
			email: email,
			password: password
		});
		if (error !== null) {
			return fail(400, {
				error: true,
				message: 'login failed'
			});
		}
		return true;
	}
};
