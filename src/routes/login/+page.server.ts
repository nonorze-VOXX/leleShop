import { supabase } from '$lib/db';
import { fail } from '@sveltejs/kit';

export const actions = {
	login: async ({ request, cookies }) => {
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
		} else {
			const access_token = (await supabase.auth.getSession()).data.session?.access_token ?? '';
			// 3 min to expires
			cookies.set('access_token', access_token, {
				path: '/lele',
				expires: new Date(Date.now() + 1000 * 60)
			});
		}

		return true;
	},
	logout: async () => {
		const { error } = await supabase.auth.signOut();
		if (error !== null) {
			return fail(400, {
				error: true,
				message: 'logout failed'
			});
		}
		return true;
	}
};
