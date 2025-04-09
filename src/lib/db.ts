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
