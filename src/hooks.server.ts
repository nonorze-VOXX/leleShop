import { supabase } from '$lib/db';
import { redirect } from '@sveltejs/kit';

import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/lele')) {
		const access_token = (await supabase.auth.getSession()).data.session?.access_token;
		if (
			access_token === undefined ||
			access_token === '' ||
			event.cookies.get('access_token') !== access_token
		) {
			throw redirect(302, '/login');
		}
	}

	const response = await resolve(event);
	return response;
};
