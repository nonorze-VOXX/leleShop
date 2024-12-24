import { supabase } from '$lib/db';
import type { Database } from '$lib/db.types';

export type CommissionRow = Database['public']['Tables']['artist_commission']['Row'];
export type CommissionInsert = Database['public']['Tables']['artist_commission']['Insert'];
export type CommissionUpdate = Database['public']['Tables']['artist_commission']['Update'];
export default {
	async GetCommissionDataByDateMax({
		artist_id,
		store_id,
		dateRange
	}: {
		artist_id?: number;
		store_id?: number;
		dateRange?: {
			start?: Date;
			end?: Date;
		};
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
		if (dateRange) {
			if (dateRange.start) {
				query = query.gte('effect_from_date', dateRange.start.toISOString());
			}
			if (dateRange.end) {
				query = query.lt('effect_from_date', dateRange.end.toISOString());
			}
		}

		const { data, error } = await query;

		if (error) {
			console.error(error);
		}
		return { data, error };
	},
	async Save(insert: CommissionInsert) {
		const { data: commission, error } = await supabase.from('artist_commission').insert(insert);
		if (error) {
			console.error(error);
		}
		return { data: commission, error };
	}
};
