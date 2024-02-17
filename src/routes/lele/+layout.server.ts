import { supabase } from '$lib/db';
import { redirect } from '@sveltejs/kit';

export const load = async ({ url }) => {
	const session = (await supabase.auth.getSession()).data.session;
	if (url.pathname !== '/lele/login' && session === null) {
		throw redirect(302, '/lele/login');
	} else if (url.pathname === '/lele/login' && session !== null) {
		throw redirect(302, '/lele');
	}
};
