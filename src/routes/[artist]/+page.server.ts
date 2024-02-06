import { supabase } from '../db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { data, error } = await supabase.from('trade').select().textSearch('artist_name', `'531'`);
	console.log(error);
	return {
		data: data ?? []
	};
};
