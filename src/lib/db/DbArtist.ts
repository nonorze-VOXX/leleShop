import { supabase } from '$lib/db';

export default {
	async GetArtistData(id: number | '*' = '*') {
		let query = supabase.from('artist').select();
		if (id !== '*') {
			query = query.eq('id', id);
		}
		const { data, error } = await query.order('id', { ascending: true });
		console.log(data, id);
		if (error !== null) {
			console.error(error);
		}
		return { data };
	},
	async GetArtistAliasList(nameList: string[]) {
		const { data, error } = await supabase
			.from('artist_alias')
			.select()
			.in('artist_alias', nameList);
		if (error) {
			throw new Error(error.message);
		}
		return data;
	}
};
