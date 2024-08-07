import { createClient, type QueryData } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY } from '$env/static/public';
import { type Database } from './db.types';
// import { PRIVATE_SUPABASE_KEY, PRIVATE_SUPABASE_URL } from '$env/static/private';
import { add } from './function/Utils';

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

const QueryTradeHeadAndBody = supabase.from('trade_body').select('*, trade_head(*)');
export type QueryTradeBodyWithTradeHead = QueryData<typeof QueryTradeHeadAndBody>;
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
	async GetOriginalData(
		id: string = '*',
		date: { firstDate: Date | null; lastDate: Date | null } = { firstDate: null, lastDate: null }
	) {
		let query = supabase.from('artist_trade').select('*');
		if (id !== '*') {
			query = query.eq('artist_id', id);
		}
		let cq = supabase.from('artist_trade').select('*', { count: 'exact', head: true });
		if (date.firstDate !== null && date.lastDate !== null) {
			query = query
				.gte('trade_date', date.firstDate.toISOString())
				.lte('trade_date', date.lastDate.toISOString());
			cq = cq
				.gte('trade_date', date.firstDate.toISOString())
				.lte('trade_date', date.lastDate.toISOString());
		}

		const { count } = await cq;
		if (count === null) {
			console.error('count is null');
			return { error: 'count is null', data: null };
		}
		const result: ArtistWithTradeRow[] = [];

		for (let i = 0; i < count; i += 1000) {
			const { data, error } = await query.range(i, i + 1000);
			if (error) {
				console.error(error);
			}
			result.push(...(data ?? []));
		}
		return { data: result, error: null };
	},
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
		return { data };
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
		date: { firstDate: Date | null; lastDate: Date | null } = { firstDate: null, lastDate: null }
	) {
		let query = supabase.from('trade_body').select('*, trade_head!inner(trade_id, trade_date)', {
			count: 'exact',
			head: true
		});
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
	async GetTradeTotal(artist_id: number, start_date: string | Date, end_date: string | Date) {
		if (start_date instanceof Date) {
			start_date = start_date.toISOString();
		}
		if (end_date instanceof Date) {
			end_date = end_date.toISOString();
		}
		const { data, error } = await supabase.rpc('get_total_trade', {
			artist_id,
			start_date,
			end_date
		});
		if (error) {
			console.error(error);
			return {
				sales_total: -1,
				net_total: -1,
				discount_total: -1,
				total_quantity: -1
			};
		}

		const total: SalesTotalData = {
			sales_total: data.f1 as number,
			net_total: data.f2 as number,
			discount_total: data.f3 as number,
			total_quantity: data.f4 as number
		};
		return total;
	},
	async GetTradeData(
		id: string,
		date: { firstDate: Date | null; lastDate: Date | null } = { firstDate: null, lastDate: null },
		page: number | null = null
	) {
		const count = (await this.GetTradeDataCount(id, date)).count as number;
		let result: QueryTradeBodyWithTradeHead = [];
		if (page !== null) {
			let query = supabase.from('trade_body').select('*, trade_head!inner(trade_id, trade_date)');

			if (id !== '*' && id !== '') {
				query = query.eq('artist_id', id);
			}
			if (date.firstDate !== null && date.lastDate !== null) {
				query = query
					.gte('trade_head.trade_date', date.firstDate.toISOString())
					.lte('trade_head.trade_date', date.lastDate.toISOString());
			}
			query.order('trade_head(trade_date)', { ascending: false });
			const { data, error } = await query.range(
				page * onePageLength,
				(page + 1) * onePageLength - 1
			);
			if (error) {
				console.error(error);
			}

			result = result.concat(data as QueryTradeBodyWithTradeHead);
		} else {
			for (let i = 0; i < count; i += 1000) {
				let query = supabase.from('trade_body').select('*, trade_head!inner(trade_id, trade_date)');

				if (id !== '*' && id !== '') {
					query = query.eq('artist_id', id);
				}
				if (date.firstDate !== null && date.lastDate !== null) {
					query = query
						.gte('trade_head.trade_date', date.firstDate.toISOString())
						.lte('trade_head.trade_date', date.lastDate.toISOString());
				}
				query.order('trade_head(trade_date)', { ascending: false });
				const { data, error } = await query.range(i, i + 1000 - 1);
				if (error) {
					console.log(error);
				}

				result = result.concat(data as QueryTradeBodyWithTradeHead);
			}

			// sort by trade_date
			// result.sort((a, b) => {
			// 	if (a.trade_head && b.trade_head) {
			// 		if (a.trade_head.trade_date < b.trade_head.trade_date) {
			// 			return -1;
			// 		}
			// 		if (a.trade_head.trade_date > b.trade_head.trade_date) {
			// 			return 1;
			// 		}
			// 	}
			// 	return 0;
			// });
		}
		return { data: result };
	}
};
