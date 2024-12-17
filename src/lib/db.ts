import { createClient, type QueryData } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY } from '$env/static/public';
import { type Database } from './db.types';
// import { PRIVATE_SUPABASE_KEY, PRIVATE_SUPABASE_URL } from '$env/static/private';
import { add } from './function/Utils';
import DbArtistTrade from './db/DbArtistTrade';

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
export type SalesTotalData = {
	sales_total: number;
	net_total: number;
	discount_total: number;
	total_quantity: number;
};
export const onePageLength = 100;

const QueryArtistWithPaymentStatus = supabase.from('artist').select('*, artist_payment_status(*)');
export type QueryArtistWithPaymentStatus = QueryData<typeof QueryArtistWithPaymentStatus>;

export default {
	async GetTradeTotalData(
		id: string = '*',
		date: { firstDate: Date | null; lastDate: Date | null } = { firstDate: null, lastDate: null }
	) {
		let query = supabase.from('artist_trade').select('total_sales,net_sales,discount'); //, sum(net_sales), sum(discount)');
		if (id !== '*') {
			query = query.eq('artist_id', id);
		}
		if (date.firstDate !== null && date.lastDate !== null) {
			query = query
				.gte('trade_date', date.firstDate.toISOString())
				.lte('trade_date', date.lastDate.toISOString());
		}

		const { data, error } = await query;
		if (error) {
			console.error(error);
		}
		let total_sales_sum = 0;
		let net_sales_sum = 0;
		let discount_sum = 0;
		if (data) {
			total_sales_sum = data.map((el) => el.total_sales ?? 0).reduce(add);
			net_sales_sum = data.map((el) => el.net_sales ?? 0).reduce(add);
			discount_sum = data.map((el) => el.discount ?? 0).reduce(add);
		}
		return { total_sales_sum, net_sales_sum, discount_sum, error: null };
	},
	async SaveArtist(artist: Artist[]) {
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
	async GetArtistData(id: string = '*') {
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
	async GetTradeIdListCount(
		date: { firstDate: Date | null; lastDate: Date | null } = { firstDate: null, lastDate: null }
	) {
		const query = supabase.from('trade_head').select('trade_id', { count: 'exact', head: true });
		if (date.firstDate !== null && date.lastDate !== null) {
			query
				.gte('trade_date', date.firstDate.toISOString())
				.lte('trade_date', date.lastDate.toISOString());
		}
		return await query;
	},
	async GetTradeIdList(
		date: { firstDate: Date | null; lastDate: Date | null } = { firstDate: null, lastDate: null }
	) {
		const count = (await this.GetTradeIdListCount(date)).count as number;
		let result: { trade_id: string }[] = [];
		for (let i = 0; i < count; i += 1000) {
			let query = supabase.from('trade_head').select('trade_id');
			if (date.firstDate !== null && date.lastDate !== null) {
				query = query
					.gte('trade_date', date.firstDate.toISOString())
					.lte('trade_date', date.lastDate.toISOString());
			}
			const { data, error } = await query.range(i, i + 1000);
			if (error !== null) {
				console.log('fetch head fail');
			}
			result = result.concat(data ?? []);
		}
		return { data: result };
	},
	async GetTradeDataCount(
		id: string,
		store_name: string | '*',
		date: { firstDate: Date | null; lastDate: Date | null } = { firstDate: null, lastDate: null }
	) {
		let query = supabase.from('artist_trade').select('*', { count: 'exact', head: true });
		if (id !== '*' && id !== '') {
			query = query.eq('artist_id', id);
		}
		if (date.firstDate !== null && date.lastDate !== null) {
			query = query
				.gte('trade_date', date.firstDate.toISOString())
				.lte('trade_date', date.lastDate.toISOString());
		}

		if (store_name !== '*') {
			query = query.eq('store_name', store_name);
		}
		const { count, error } = await query;

		if (error) {
			console.log(error);
		}

		console.log(count);
		return { count };
	},
	async GetArtistTradeTotal(
		column: 'total_sales' | 'net_sales' | 'discount' | 'quantity',
		condition: {
			artist_id: number;
			store_name: string | '*';
			start_date: Date;
			end_date: Date;
		}
	) {
		let out_data, out_error;
		if (condition.store_name === '*') {
			const { data, error } = await supabase
				.from('artist_trade')
				.select(column + '.sum()')
				.eq('artist_id', condition.artist_id)
				.gte('trade_date', condition.start_date.toISOString())
				.lt('trade_date', condition.end_date.toISOString())
				.single();
			out_data = data;
			out_error = error;
		} else {
			const { data, error } = await supabase
				.from('artist_trade')
				.select(column + '.sum()')
				.eq('artist_id', condition.artist_id)
				.gte('trade_date', condition.start_date.toISOString())
				.lt('trade_date', condition.end_date.toISOString())
				.eq('store_name', condition.store_name)
				.single();
			out_data = data;
			out_error = error;
		}

		if (out_error) {
			console.error(out_error);
			alert(out_error.message);
			return null;
		}
		const { sum } = out_data as unknown as { sum: number | null }; // supabase not support this type now
		return sum ?? 0;
	},
	async GetTradeTotal(
		artist_id: number,
		store_name: string | '*',
		start_date: Date,
		end_date: Date
	) {
		// const columns = ['total_sales', 'net_sales', 'discount', 'quantity'];
		const condition = {
			artist_id,
			store_name,
			start_date,
			end_date
		};

		const total_sales = await this.GetArtistTradeTotal('total_sales', condition);
		const net_sales = await this.GetArtistTradeTotal('net_sales', condition);
		const discount = await this.GetArtistTradeTotal('discount', condition);
		const quantity = await this.GetArtistTradeTotal('quantity', condition);

		return {
			sales_total: net_sales ?? 0,
			net_total: total_sales ?? 0,
			discount_total: discount ?? 0,
			total_quantity: quantity ?? 0
		};
	},
	artistTrade: DbArtistTrade
};
