import { supabase, type ArtistWithTradeRow } from '$lib/db';
const onePageLength = 1000;

export default {
	async GetTradeFullData({
		id,
		date,
		csv
	}: {
		id?: number;
		date?: { firstDate: Date; lastDate: Date };
		csv?: boolean;
	} = {}) {
		const { error, count } = await supabase
			.from('artist_trade')
			.select('*', { head: true, count: 'estimated' });
		if (error) {
			console.error(error);
		}
		if (count) {
			const query = supabase
				.from('artist_trade')
				.select('*')
				.order('trade_date', { ascending: false });
			if (id) {
				query.eq('artist_id', id);
			}
			if (date) {
				query
					.gte('trade_date', date.firstDate.toISOString())
					.lte('trade_date', date.lastDate.toISOString());
			}
			const result: ArtistWithTradeRow[] = [];
			if (csv) {
				const { data, error } = await query.csv();
				if (error) {
					console.error(error);
				}
				return { data: null, count, csv: data, error };
			} else {
				for (let i = 0; i < count; i += onePageLength) {
					const { data, error } = await query.range(i, i + onePageLength - 1);
					if (error) {
						console.error(error);
					}
					if (data) {
						result.push(...data);
					}
				}
			}

			return { data: result, count };
		}
		return { data: null, count: 0 };
	},
	async GetTradeDataWithPage(
		{
			id,
			date,
			page,
			store_name
		}: {
			id?: number;
			date?: { firstDate: Date; lastDate: Date };
			page: number;
			store_name: string | '*';
		} = { page: 0, store_name: '*' }
	) {
		let query = supabase.from('artist_trade').select('*');
		if (id) {
			query = query.eq('artist_id', id);
		}
		if (date) {
			query = query
				.gte('trade_date', date.firstDate.toISOString())
				.lte('trade_date', date.lastDate.toISOString());
		}
		if (store_name !== '*') {
			query = query.eq('store_name', store_name);
		}
		query.order('trade_date', { ascending: false });
		query = query.range(page * onePageLength, (page + 1) * onePageLength - 1);
		const { data, error } = await query;
		if (error) {
			console.error(error);
		}
		return { data };
	}
};
