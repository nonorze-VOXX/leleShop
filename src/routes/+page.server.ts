import { supabase } from '$lib/db';

export const load = async () => {
	let query = supabase.from('artist').select('id, artist_name, visible,artist_payment_status(*)');

	query = query
		.eq('visible', true)
		.eq('artist_payment_status.season', '2024-03')
		.order('id', { ascending: true });
	const { data, error } = await query;
	if (error) {
		console.log(error);
	}
	console.log(data);
	return { data };
};
