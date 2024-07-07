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
export type PaymentStatusInsert = Database['public']['Tables']['artist_payment_status']['Insert'];
export type PaymentStatusRow = Database['public']['Tables']['artist_payment_status']['Row'];
export type PaymentStatusUpdate = Database['public']['Tables']['artist_payment_status']['Update'];
export type ArtistWithTradeRow = Database['public']['Views']['artist_trade']['Row'];
export type ArtistWithTradeWithShopRow =
	Database['public']['Views']['artist_trade_with_shop']['Row'];
export type ShopInsert = Database['public']['Tables']['shop']['Insert'];
export type ShopRow = Database['public']['Tables']['shop']['Row'];
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
			const { data, error } = await query.range(i, i + 999);
			if (error) {
				console.error(error);
			}
			result.push(...(data ?? []));
		}
		return { data: result, error: null };
	},
	async ChangePaymentStatus(update: PaymentStatusUpdate, id: number) {
		if (!update.artist_id) {
			return { error: 'artist_id is required' };
		}
		if (!update.season) {
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
			const { data, error } = await query.range(i, i + 999);
			if (error !== null) {
				console.log('fetch head fail');
			}
			result = result.concat(data ?? []);
		}
		return { data: result };
	},
	async GetTradeDataCount(
		id: string,
		date: { firstDate: Date | null; lastDate: Date | null } = { firstDate: null, lastDate: null },
		shop_id: number | '*' = '*'
	) {
		let query = supabase
			.from('artist_trade_with_shop')
			.select('*', { count: 'exact', head: false });
		if (id !== '*' && id !== '') {
			query = query.eq('artist_id', id);
		}
		if (date.firstDate !== null && date.lastDate !== null) {
			query = query
				.gte('trade_date', date.firstDate.toISOString())
				.lte('trade_date', date.lastDate.toISOString());
		}
		if (shop_id !== '*') {
			query = query.eq('shop_id', shop_id);
		}
		const { count, error } = await query;
		console.log('falsg');
		console.log(count);

		if (error) {
			console.log(error);
		}

		return { count };
	},
	async GetTradeTotal(
		artist_id: number,
		start_date: string | Date,
		end_date: string | Date,
		shop_id: number | '*'
	) {
		if (start_date instanceof Date) {
			start_date = start_date.toISOString();
		}
		if (end_date instanceof Date) {
			end_date = end_date.toISOString();
		}

		let data: Record<string, unknown> | null;

		if (shop_id === '*') {
			const { data: allData, error } = await supabase.rpc('get_total_trade', {
				artist_id,
				start_date,
				end_date
			});
			data = allData;
			if (error) {
				console.error(error);
				return {
					sales_total: -1,
					net_total: -1,
					discount_total: -1,
					total_quantity: -1
				};
			}
		} else {
			const { data: allData, error } = await supabase.rpc('get_total_trade_with_shop', {
				artist_id,
				start_date,
				end_date,
				shop_id
			});
			data = allData;
			if (error) {
				console.error(error);
				return {
					sales_total: -1,
					net_total: -1,
					discount_total: -1,
					total_quantity: -1
				};
			}
		}
		const typedData = data as {
			f1: number | null;
			f2: number | null;
			f3: number | null;
			f4: number | null;
		};

		const total: SalesTotalData = {
			sales_total: typedData.f1 ?? 0,
			net_total: typedData.f2 ?? 0,
			discount_total: typedData.f3 ?? 0,
			total_quantity: typedData.f4 ?? 0
		};
		return total;
	},
	async GetTradeData(
		id: string,
		date: { firstDate: Date | null; lastDate: Date | null } = { firstDate: null, lastDate: null },
		page: number | null = null,
		shop_id: number | '*' = '*'
	) {
		const count = (await this.GetTradeDataCount(id, date, shop_id)).count as number;
		let result: ArtistWithTradeWithShopRow[] = [];
		if (page !== null) {
			let query = supabase.from('artist_trade_with_shop').select('*');

			if (id !== '*' && id !== '') {
				query = query.eq('artist_id', id);
			}
			if (date.firstDate !== null && date.lastDate !== null) {
				query = query
					.gte('trade_date', date.firstDate.toISOString())
					.lte('trade_date', date.lastDate.toISOString());
			}
			if (shop_id !== '*') {
				query = query.eq('shop_id', shop_id);
			}
			query.order('trade_date', { ascending: false });
			const { data, error } = await query.range(
				page * onePageLength,
				(page + 1) * onePageLength - 1
			);
			if (error) {
				console.error(error);
			}

			result = result.concat(data ?? []);
		} else {
			for (let i = 0; i < count; i += 1000) {
				let query = supabase.from('artist_trade_with_shop').select('*');

				if (id !== '*' && id !== '') {
					query = query.eq('artist_id', id);
				}
				if (date.firstDate !== null && date.lastDate !== null) {
					query = query
						.gte('trade_date', date.firstDate.toISOString())
						.lte('trade_date', date.lastDate.toISOString());
				}
				if (shop_id !== '*') {
					query = query.eq('shop_id', shop_id);
				}
				query.order('trade_date', { ascending: false });
				const { data, error } = await query.range(i, i + 999);
				if (error) {
					console.log(error);
				}

				result = result.concat(data ?? []);
			}
		}
		return { data: result };
	},
	async GetArtistDataWithPaymentStatus(option?: {
		id?: string;
		visible?: boolean | null;
		season: number;
	}) {
		let { id, visible, season } = option ?? {};
		id = id ?? '*';
		visible = visible === undefined ? true : visible;

		let query = supabase.from('artist').select('id, artist_name, visible,artist_payment_status(*)');
		if (id !== '*') {
			query = query.eq('id', id);
		}

		if (visible !== null) {
			query = query.eq('visible', visible);
		}
		if (season) {
			query = query.eq('artist_payment_status.season', season);
		} else {
			return { data: [], error: 'season is required' };
		}

		query = query.order('id', { ascending: true });
		const { data, error } = await query;
		if (error) {
			console.error(error);
		}
		var value = data?.filter((e) => e.artist_payment_status.length > 0) ?? [];
		var result: {
			id: number;
			artist_name: string;
			visible: boolean;
			artist_payment_status: PaymentStatusRow;
		}[] = [];
		for (let i = 0; i < value.length; i++) {
			var e = value[i];
			var single = e.artist_payment_status.at(0) as PaymentStatusRow;
			result.push({
				id: e.id,
				artist_name: e.artist_name,
				visible: e.visible,
				artist_payment_status: single
			});
		}
		return { data: result, error };
	},
	async GetShopList() {
		const { data, error } = await supabase.from('shop').select('*');
		if (error) {
			console.error(error);
		}
		console.log(data);
		return { data };
	}
};
