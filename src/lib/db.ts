import { createClient, type QueryData } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY } from '$env/static/public';
import { type Database } from './db.types';

export const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY);

export type TradeHead = Database['public']['Tables']['trade_head']['Insert'];
export type TradeBody = Database['public']['Tables']['trade_body']['Insert'];
export type Artist = Database['public']['Tables']['artist']['Insert'];

const QueryTradeHeadAndBody = supabase.from('trade_body').select('*, trade_head(*)');
export type TradeBodyWithTradeHead = QueryData<typeof QueryTradeHeadAndBody>;
export default {
	async SaveArtistName(artist: Artist[]) {
		const { error, data } = await supabase.from('artist').insert(artist).select();
		if (error !== null) {
			console.log(error);
		}
		return { error, data };
	},
	async SaveTradeBody(body: TradeBody[]) {
		const { data, error } = await supabase.from('trade_body').insert(body).select();
		if (error !== null) {
			console.log(error);
		}
		return { data, error };
	},
	async SaveTradeHead(head: TradeHead[]) {
		const { data, error } = await supabase.from('trade_head').insert(head).select();
		if (error !== null) {
			console.log(error);
		}
		return { data, error };
	},
	async GetTradeData(id: string) {
		if (id === '*' || id === '') {
			const { data, error } = await supabase
				.from('trade_body')
				.select('*, trade_head(trade_id, trade_date, state)')
				.eq('trade_head.state', '關閉');
			if (error) {
				console.log(error);
			}

			return data;
		} else {
			const { data, error } = await supabase
				.from('trade_body')
				.select('*, trade_head(trade_id, trade_date, state)')
				.eq('trade_head.state', '關閉')
				.eq('artist_id', id);
			if (error) {
				console.log(error);
			}

			return data;
		}
	}
};
