import { createClient, type QueryData } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY } from '$env/static/public';
import { type Database } from './db.types';

export const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY);

export type TradeHead = Database['public']['Tables']['trade_head']['Insert'];
export type TradeBody = Database['public']['Tables']['trade_body']['Insert'];
export type Artist = Database['public']['Tables']['artist']['Insert'];
export type ArtistRow = Database['public']['Tables']['artist']['Row'];

const QueryTradeHeadAndBody = supabase.from('trade_body').select('*, trade_head(*)');
export type QueryTradeBodyWithTradeHead = QueryData<typeof QueryTradeHeadAndBody>;
export default {
	async SaveArtistName(artist: Artist[]) {
		const { error, data } = await supabase.from('artist').insert(artist).select();
		if (error !== null) {
			console.error(error);
		}
		return { data, error };
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
	async GetArtistName(id: string = '*') {
		let query = supabase.from('artist').select();
		if (id !== '*') {
			query = query.eq('id', id);
		}
		const { data, error } = await query;
		if (error !== null) {
			console.error(error);
		}
		return { data };
	},

	async GetArtistDataList(
		option: { ordered: boolean; ascending: boolean } = { ordered: false, ascending: false }
	) {
		let query = supabase.from('artist').select();
		if (option.ordered) {
			query = query.order('id', { ascending: option.ascending });
		}
		const { data, error } = await query;
		if (error) {
			console.error(error);
		}
		return { data };
	},
	async GetTradeIdList() {
		const { data, error } = await supabase.from('trade_head').select('trade_id');
		if (error != null) {
			console.log('fetch head fail');
		}
		return { data };
	},
	async GetTradeDataCount(
		id: string,
		date: { firstDate: Date | null; lastDate: Date | null } = { firstDate: null, lastDate: null }
	) {
		let query = supabase
			.from('trade_body')
			.select('*, trade_head!inner(trade_id, trade_date, state)', {
				count: 'exact',
				head: true
			})
			.eq('trade_head.state', '關閉');
		if (id !== '*' && id !== '') {
			query = query.eq('artist_id', id);
		}
		if (date.firstDate !== null && date.lastDate !== null) {
			query = query
				.gte('trade_head.trade_date', date.firstDate.toISOString())
				.lte('trade_head.trade_date', date.lastDate.toISOString());
		}
		const { count, error } = await query;

		if (error) {
			console.log(error);
		}

		return { count };
	},
	async GetTradeData(
		id: string,
		date: { firstDate: Date | null; lastDate: Date | null } = { firstDate: null, lastDate: null }
	) {
		const count = (await this.GetTradeDataCount(id, date)).count as number;
		let result: QueryTradeBodyWithTradeHead = [];

		for (let i = 0; i < count; i += 1000) {
			let query = supabase
				.from('trade_body')
				.select('*, trade_head!inner(trade_id, trade_date, state)')
				.eq('trade_head.state', '關閉');

			if (id !== '*' && id !== '') {
				query = query.eq('artist_id', id);
			}
			if (date.firstDate !== null && date.lastDate !== null) {
				query = query
					.gte('trade_head.trade_date', date.firstDate.toISOString())
					.lte('trade_head.trade_date', date.lastDate.toISOString());
			}
			const { data, error } = await query.range(i, i + 1000);
			// console.log(data);
			if (error) {
				console.log(error);
			}

			result = result.concat(data as QueryTradeBodyWithTradeHead);
		}
		return { data: result };
	}
};
