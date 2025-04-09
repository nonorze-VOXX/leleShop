import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY } from '$env/static/public';
import { type Database } from './db.types';
// import { PRIVATE_SUPABASE_KEY, PRIVATE_SUPABASE_URL } from '$env/static/private';
import DbArtistTrade from './db/DbArtistTrade';
import DbCommission from './db/DbCommission';
import DbStore from './db/DbStore';
import DbArtist from './db/DbArtist';

// export const supabase = createClient<Database>(PRIVATE_SUPABASE_URL, PRIVATE_SUPABASE_KEY);
export const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY);

export type TradeHead = Database['public']['Tables']['trade_head']['Insert'];
export type TradeHeadRow = Database['public']['Tables']['trade_head']['Row'];
export type TradeBody = Database['public']['Tables']['trade_body']['Insert'];
export type TradeBodyRow = Database['public']['Tables']['trade_body']['Row'];
export type Artist = Database['public']['Tables']['artist']['Insert'];
export type ArtistRow = Database['public']['Tables']['artist']['Row'];
export type ArtistViewRow = Database['public']['Views']['default_artist_view']['Row'];
export type ArtistUpdate = Database['public']['Tables']['artist']['Update'];
export type ArtistWithTradeRow = Database['public']['Views']['artist_trade']['Row'];
export type StoreRow = Database['public']['Tables']['store']['Row'];
export type ArtistAliasMapRow = Database['public']['Views']['artist_alias_map']['Row'];
export type SalesTotalData = {
	sales_total: number;
	net_total: number;
	discount_total: number;
	total_quantity: number;
};
export const onePageLength = 100;

export default {
	artist: DbArtist,

	async GetArtistDataList(
		option: { ordered: boolean; ascending: boolean } = { ordered: true, ascending: true }
	) {
		let query = supabase.from('artist').select();
		if (option.ordered) {
			query = query.order('id', { ascending: option.ascending });
		}
		const { data, error } = await query;
		if (error) {
			console.error(error);
		}
		return { data, error };
	},
	async GetTradeDataCount(
		id: number,
		store_name_list: string[] | '*',
		date: { firstDate: Date | null; lastDate: Date | null } = { firstDate: null, lastDate: null }
	) {
		let query = supabase.from('artist_trade').select('*', { count: 'exact', head: true });
		query = query.eq('artist_id', id);

		if (date.firstDate !== null && date.lastDate !== null) {
			query = query
				.gte('trade_date', date.firstDate.toISOString())
				.lte('trade_date', date.lastDate.toISOString());
		}
		if (store_name_list !== '*') {
			query = query.in('store_name', store_name_list);
		}
		const { count, error } = await query;
		if (error) {
			console.error(error);
		}
		return { count };
	},
	async GetTradeTotal(
		artist_id: number,
		store_list: string[] | '*',
		start_date: Date,
		end_date: Date
	) {
		let preQurey = supabase
			.from('artist_trade')
			.select(
				'total_sales:total_sales.sum(), net_sales:net_sales.sum(), discount:discount.sum(), quantity:quantity.sum()'
			)
			.eq('artist_id', artist_id)
			.gte('trade_date', start_date.toISOString())
			.lt('trade_date', end_date.toISOString());

		if (store_list !== '*') {
			preQurey = preQurey.in('store_name', store_list);
		}

		const { data, error } = await preQurey.single();
		if (error) {
			console.error(error);
			alert(error.message);
			return {
				sales_total: 0,
				net_total: 0,
				discount_total: 0,
				total_quantity: 0
			};
		}
		const { total_sales, net_sales, discount, quantity } = data;

		return {
			sales_total: total_sales ?? 0,
			net_total: net_sales ?? 0,
			discount_total: discount ?? 0,
			total_quantity: quantity ?? 0
		};
	},
	async GetTradeDataMinYear() {
		const { data, error } = await supabase
			.from('artist_trade')
			.select('trade_date')
			.order('trade_date')
			.limit(1)
			.single();
		if (error) {
			console.error(error);
			return { data: null, error };
		}
		return {
			data: new Date(data.trade_date ?? '').getFullYear(),
			error: null
		};
	},
	artistTrade: DbArtistTrade,
	commission: DbCommission,
	store: DbStore
};
