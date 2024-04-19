import { supabase } from '$lib/db';
import { GetSeason } from '$lib/function/Utils';

export const load = async () => {
	let query = supabase.from('artist').select('id, artist_name, visible,artist_payment_status(*)');

	query = query
		.eq('visible', true)
		.in('artist_payment_status.year_month', [GetSeason(0), GetSeason(1), GetSeason(2)])
		.order('id', { ascending: true });
	const { data, error } = await query;
	const artistData = data ?? [];
	artistData.forEach((element) => {
		element.artist_payment_status.sort((a, b) => {
			if (a.year_month < b.year_month) return -1;
			else if (a.year_month > b.year_month) return 1;
			return 0;
		});
	});
	if (error) {
		console.log(error);
	}
	return { data };
};
