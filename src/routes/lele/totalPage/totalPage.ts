import { supabase } from '$lib/db';
import { arr_sum } from '$lib/function/Utils';

export async function GetTradeTotalDataEachOne(firstDate: Date, lastDate: Date) {
	if (!firstDate || !lastDate) {
		return { error: 'invalid date', result: [] };
	}
	const query = supabase
		.from('artist')
		.select('id,artist_name, artist_trade!inner(*)')
		.gte('artist_trade.trade_date', firstDate.toISOString())
		.lt('artist_trade.trade_date', lastDate.toISOString());

	const { data, error } = await query;
	if (error) {
		console.error(error);
		return {
			error: 'get trade data fail',
			result: []
		};
	}

	const result: {
		id: number;
		name: string;
		total_sales_sum: number;
		net_sales_sum: number;
		discount_sum: number;
	}[] = [];

	for (let i = 0; i < data.length; i++) {
		const element = data[i];
		const total_sales_sum = arr_sum(element.artist_trade.map((el) => el.total_sales ?? 0));
		const net_sales_sum = arr_sum(element.artist_trade.map((el) => el.net_sales ?? 0));
		const discount_sum = arr_sum(element.artist_trade.map((el) => el.discount ?? 0));
		result.push({
			name: element.artist_name,
			id: element.id,
			total_sales_sum,
			net_sales_sum,
			discount_sum
		});
	}

	return { result, error: null };
}
