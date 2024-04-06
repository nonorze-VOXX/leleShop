import { createClient, type QueryData } from '@supabase/supabase-js';
// import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY } from '$env/static/public';
import { type Database } from './db.types';
import { PRIVATE_SUPABASE_KEY, PRIVATE_SUPABASE_URL } from '$env/static/private';
import { fail } from '@sveltejs/kit';

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

const PreInsertPaymentStatus = async (season: string) => {
	const artistData = (await GetArtistDataList({ ordered: true, ascending: true }))?.data ?? [];

	const { data, error } = await GetPaymentStatus({ season });
	if (error) {
		console.error(error);
		return { newData: [], paymentData: [], error: 'get payment status fail' };
	}
	const noPaymentList: PaymentStatusInsert[] = [];
	if (artistData?.length !== data?.length) {
		artistData.forEach((element) => {
			if (element.id !== data?.find((e) => e.artist_id === element.id)?.artist_id) {
				noPaymentList.push({ artist_id: element.id, season, process_state: 'todo' });
			}
		});
	}
	if (noPaymentList.length === 0) {
		return { error: null, newData: [], paymentData: data };
	}
	const result = await InsertPaymentStatus(noPaymentList);
	if (result.error) {
		return { error: result.error, newData: [], paymentData: data };
	}
	const newData = result.data ?? [];
	return { error: null, newData: newData, paymentData: data };
};
const ChangePaymentStatus = async (update: PaymentStatusUpdate, id: number) => {
	if (!update.artist_id) {
		return { error: 'artist_id is required' };
	}
	if (!update.season) {
		return { error: 'season is required' };
	}
	const { data, error } = await supabase
		.from('artist_payment_status')
		.update(update)
		.eq('id', id)
		.select();
	if (error !== null) {
		console.error(error);
	}
	console.log(data);
	return { error };
};
const GetArtistDataList = async (
	option: { ordered: boolean; ascending: boolean } = { ordered: false, ascending: false }
) => {
	let query = supabase.from('artist').select();
	if (option.ordered) {
		query = query.order('id', { ascending: option.ascending });
	}
	const { data, error } = await query;
	if (error) {
		console.error(error);
	}
	return { data };
};
const GetPaymentStatus = async (
	{ artist_id, season }: { artist_id?: string; season?: string },
	ordered: boolean = true
) => {
	let query = supabase.from('artist_payment_status').select('*');
	if (artist_id) {
		query = query.eq('artist_id', artist_id);
	}
	if (season) {
		query = query.eq('season', season);
	}
	if (ordered) {
		query = query.order('id', { ascending: true });
	}
	const { error, data } = await query;
	if (error !== null) {
		console.error(error);
	}
	return { data, error };
};
const InsertPaymentStatus = async (paymentStatusList: PaymentStatusInsert[]) => {
	const { error, data } = await supabase
		.from('artist_payment_status')
		.insert(paymentStatusList)
		.select();
	if (error !== null) {
		console.error(error);
	}
	return { data, error };
};

export default {
	ChangePaymentStatus,
	InsertPaymentStatus,
	GetPaymentStatus,
	PreInsertPaymentStatus,
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

	GetArtistDataList,
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
			// console.log(data);
			if (error) {
				console.log(error);
			}

			result = result.concat(data as QueryTradeBodyWithTradeHead);
		}
		return { data: result };
	}
};
