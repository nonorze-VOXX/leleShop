import { supabase } from '$lib/db';
import type { Database } from '$lib/db.types';

export type CommissionRow = Database['public']['Tables']['artist_commission']['Row'];
export type CommissionInsert = Database['public']['Tables']['artist_commission']['Insert'];
export type CommissionUpdate = Database['public']['Tables']['artist_commission']['Update'];
export type CommissionViewRow = Database['public']['Views']['default_commission_view']['Row'];
export default {
	async GetCommissionDataByDateMax({
		artist_id,
		store_id,
		year_month
	}: {
		artist_id?: number;
		store_id?: number;
		year_month?: string;
	}) {
		// limit use one artist one store one time can get single commission

		let query = supabase
			.from('default_commission_view')
			.select('*')
			.order('effect_from_date', { ascending: false })
			.limit(1);

		if (artist_id) {
			query = query.eq('artist_id', artist_id);
		}
		if (store_id) {
			query = query.eq('store_id', store_id);
		}
		if (year_month) {
			query = query.gte('year_month', year_month);
		}

		const { data, error } = await query;

		if (error) {
			console.error(error);
		}
		return { data, error };
	},
	async Save(insert: CommissionInsert) {
		const { data: commission, error } = await supabase
			.from('artist_commission')
			.insert(insert)
			.select();
		if (error) {
			console.error(error);
		}
		return { data: commission, error };
	}
};
