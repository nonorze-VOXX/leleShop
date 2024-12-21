import { supabase } from '$lib/db';
const onePageLength = 1000;

export default {
	async GetTradeCsv(
		{
			id,
			date,
			store_list
		}: {
			id?: number;
			date?: { firstDate: Date; lastDate: Date };
			store_list: string[] | '*';
		} = { store_list: '*' }
	) {
		const query = supabase
			.from('artist_trade')
			.select(
				'artist_name,trade_id,item_name	,quantity,total_sales,discount,net_sales,trade_date,store_name'
			)
			.order('trade_date', { ascending: false });
		if (id) {
			query.eq('artist_id', id);
		}
		if (date) {
			query
				.gte('trade_date', date.firstDate.toISOString())
				.lte('trade_date', date.lastDate.toISOString());
		}

		if (store_list !== '*') {
			query.in('store_name', store_list);
		}
		const { data, error } = await query.csv();
		if (error) {
			console.error(error);
		}
		return { csv: data, error };
	},
	async GetTradeDataWithPage(
		{
			id,
			date,
			page,
			store_list
		}: {
			id?: number;
			date?: { firstDate: Date; lastDate: Date };
			page: number;
			store_list: string[] | '*';
		} = { page: 0, store_list: '*' }
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

		if (store_list !== '*') {
			console.log('store_list');
			console.log(store_list);
			query = query.in('store_name', store_list);
		}
		query.order('trade_date', { ascending: false });
		query = query.range(page * onePageLength, (page + 1) * onePageLength - 1);
		const { data, error } = await query;
		if (error) {
			console.error(error);
		}
		console.log('query data');
		console.log(data);
		return { data };
	}
};
