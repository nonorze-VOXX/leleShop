import { supabase } from '$lib/db';
import { fail } from '@sveltejs/kit';

export const load = async () => {
	return {
		logined: (await supabase.auth.getSession()).data.session !== null
	};
};
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
	},
	logout: async () => {
		console.log(await supabase.auth.getSession());
		const { error } = await supabase.auth.signOut();
		if (error !== null) {
			return fail(400, {
				error: true,
				message: 'logout failed'
			});
		}
		console.log(await supabase.auth.getSession());
		return true;
	}
};
