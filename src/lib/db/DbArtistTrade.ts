import { supabase } from '$lib/db';
const onePageLength = 1000;

export default {
	async GetTradeCsv(
		{
			id,
			date,
			store_id
		}: {
			id?: number;
			date?: { firstDate: Date; lastDate: Date };
			store_id: number | '*';
		} = { store_id: '*' }
	) {
		let store_name = '*';
		if (store_id !== '*') {
			const { data: storeData, error: storeError } = await supabase
				.from('store')
				.select('store_name')
				.eq('id', store_id)
				.single();
			if (storeError) {
				console.error(storeError);
			}
			if (storeData) {
				store_name = storeData.store_name;
			}
		}

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
		if (store_name !== '*') {
			query.eq('store_name', store_name);
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
