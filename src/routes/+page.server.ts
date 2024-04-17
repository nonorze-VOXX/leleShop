import { supabase } from '$lib/db';
import { GetSeason } from '$lib/function/Utils';

export const load = async () => {
	let query = supabase.from('artist').select('id, artist_name, visible,artist_payment_status(*)');

	query = query
		.eq('visible', true)
		.in('artist_payment_status.year_month', [GetSeason(0), GetSeason(1), GetSeason(2)])
		.order('id', { ascending: true });
	const { data, error } = await query;
	if (error) {
		console.log(error);
	}
	return { data };
};
