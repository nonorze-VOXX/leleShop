import { supabase } from '$lib/db';

export const load = async () => {
	const { data, error } = await supabase
		.from('artist')
		.select('id, artist_name')
		.order('id', { ascending: true });
	if (error) {
		console.log(error);
	}
	return { data };
};
