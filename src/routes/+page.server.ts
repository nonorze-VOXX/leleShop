import { supabase } from '$lib/db';
import { GetYearMonth } from '$lib/function/Utils';

export const load = async () => {
	let query = supabase.from('artist').select('id, artist_name, visible,artist_payment_status(*)');

	query = query
		.eq('visible', true)
		.eq('artist_payment_status.year_month', GetYearMonth())
		.order('id', { ascending: true });
	const { data, error } = await query;
	if (error) {
		console.log(error);
	}
	return { data };
};
