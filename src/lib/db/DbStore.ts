import { supabase } from '$lib/db';

export default {
	async getStoreData() {
		const { data, error } = await supabase.from('store').select('*');
		if (error) {
			console.error(error);
		}
		return { data, error };
	}
};
