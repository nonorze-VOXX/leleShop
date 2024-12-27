import { supabase } from '$lib/db';

export async function GetTradeTotalDataEachOne(
	firstDate: Date,
	lastDate: Date,
	store_list: string[] | '*'
) {
	if (!firstDate || !lastDate) {
		return { error: 'invalid date', result: [] };
	}
	const query = supabase
		.from('artist_trade')
		.select(
			'total_sales:total_sales.sum(), net_sales:net_sales.sum(), discount:discount.sum(), quantity:quantity.sum(), artist_id, artist_name'
		)
		.gte('trade_date', firstDate.toISOString())
		.lt('trade_date', lastDate.toISOString())
		.order('artist_id', { ascending: true });

	if (store_list !== '*') {
		query.in('store_name', store_list);
	}

	const { data, error } = await query;

	if (error) {
		console.error(error);
		alert(error.message);
		return {
			error: 'get trade data fail',
			result: null
		};
	}

	return { data, error: null };
}

export async function GetCommission(year_month: string, selectedStore: string) {
	const { data, error } = await supabase
		.from('default_commission_view')
		.select('*')
		.eq('store_name', selectedStore)
		.eq('year_month', year_month);
	if (error) {
		console.error(error);
		return [];
	}
	return data ?? [];
}
