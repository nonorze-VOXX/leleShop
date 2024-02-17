import { supabase } from '$lib/db';
import { fail } from '@sveltejs/kit';

export const actions = {
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
