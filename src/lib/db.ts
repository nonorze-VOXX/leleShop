import { createClient, type QueryData } from '@supabase/supabase-js';
// import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY } from '$env/static/public';
import { type Database } from './db.types';
import { PRIVATE_SUPABASE_KEY, PRIVATE_SUPABASE_URL } from '$env/static/private';
import { GetSeason, payment_compare_year_month } from './function/Utils';

// export const supabase = createClient<Database>(PRIVATE_SUPABASE_URL, PRIVATE_SUPABASE_KEY);
export const supabase = createClient<Database>(PRIVATE_SUPABASE_URL, PRIVATE_SUPABASE_KEY);

export type TradeHead = Database['public']['Tables']['trade_head']['Insert'];
export type TradeBody = Database['public']['Tables']['trade_body']['Insert'];
export type Artist = Database['public']['Tables']['artist']['Insert'];
export type ArtistRow = Database['public']['Tables']['artist']['Row'];
export type PaymentStatusInsert = Database['public']['Tables']['artist_payment_status']['Insert'];
export type PaymentStatusRow = Database['public']['Tables']['artist_payment_status']['Row'];
export type PaymentStatusUpdate = Database['public']['Tables']['artist_payment_status']['Update'];

const QueryTradeHeadAndBody = supabase.from('trade_body').select('*, trade_head(*)');
export type QueryTradeBodyWithTradeHead = QueryData<typeof QueryTradeHeadAndBody>;
const QueryArtistWithPaymentStatus = supabase.from('artist').select('*, artist_payment_status(*)');
export type QueryArtistWithPaymentStatus = QueryData<typeof QueryArtistWithPaymentStatus>;

export default {
	async ChangePaymentStatus(update: PaymentStatusUpdate, id: number) {
		if (!update.artist_id) {
			return { error: 'artist_id is required' };
		}
		if (!update.year_month) {
			return { error: 'season is required' };
		}
		const { error } = await supabase
			.from('artist_payment_status')
			.update(update)
			.eq('id', id)
			.select();
		if (error !== null) {
			console.error(error);
		}
		return { error };
	},
	async InsertPaymentStatus(paymentStatusList: PaymentStatusInsert[]) {
		const { error, data } = await supabase
			.from('artist_payment_status')
			.insert(paymentStatusList)
			.select();
		if (error !== null) {
			console.error(error);
		}
		return { data, error };
	},
	async GetPaymentStatus(
		{ artist_id, year_month: year_month }: { artist_id?: string; year_month?: string },
		ordered: boolean = true
	) {
		let query = supabase.from('artist_payment_status').select('*');
		if (artist_id) {
			query = query.eq('artist_id', artist_id);
		}
		if (year_month) {
			query = query.eq('year_month', year_month);
		}
		if (ordered) {
			query = query.order('id', { ascending: true });
		}
		const { error, data } = await query;
		if (error !== null) {
			console.error(error);
		}
		return { data, error };
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
			if (error) {
				console.log(error);
			}

			result = result.concat(data as QueryTradeBodyWithTradeHead);
		}
		return { data: result };
	},
	async GetArtistDataWithPaymentStatus(option?: {
		id?: string;
		visible?: boolean | null;
		year_month_list?: string[];
	}) {
		option = option ?? {
			id: '*',
			visible: true,
			year_month_list: [GetSeason(0), GetSeason(1), GetSeason(2)]
		};
		let { id, visible, year_month_list } = option;
		id = id ?? '*';
		visible = visible ?? true;
		year_month_list = year_month_list ?? [GetSeason(0), GetSeason(1), GetSeason(2)];

		let query = supabase.from('artist').select('id, artist_name, visible,artist_payment_status(*)');
		if (id !== '*') {
			query = query.eq('id', id);
		}

		if (visible !== null) {
			query = query.eq('visible', visible);
		}
		if (year_month_list.length > 0) {
			query = query.in('artist_payment_status.year_month', year_month_list);
		}

		query = query.order('id', { ascending: true });
		const { data, error } = await query;
		const artistData = data ?? [];
		artistData.forEach((element) => {
			element.artist_payment_status.sort(payment_compare_year_month);
		});
		if (error) {
			console.error(error);
		}
		return { data, error };
	}
};
