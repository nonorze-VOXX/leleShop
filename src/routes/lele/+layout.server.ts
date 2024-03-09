import { supabase } from '$lib/db';
import { redirect } from '@sveltejs/kit';

export const load = async () => {
	const session = (await supabase.auth.getSession()).data.session;
	if (session === null) {
		throw redirect(302, '/login');
	}
};
