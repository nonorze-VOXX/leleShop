import { supabase } from '$lib/db';

export const load = async () => {
	const { data, error } = await supabase
		.from('artist')
		.select('id, artist_name, visible')
		.eq('visible', true)
		.order('id', { ascending: true });
	if (error) {
		console.log(error);
	}
	return { data };
};
