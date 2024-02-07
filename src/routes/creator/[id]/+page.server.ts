import { supabase } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const date = new Date();
	const firstDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1));
	const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
	const { data, error } = await supabase
		.from('trade_body')
		.select('*, trade_head!inner(trade_id, trade_date, state)')
		.gt('trade_head.trade_date', firstDay.toISOString())
		.lt('trade_head.trade_date', lastDay.toISOString())
		.textSearch('artist_name', params.id);

	if (error !== null) {
		console.log(error);
	}

	const result = data as unknown as tradeUnit[];
	return {
		data: result ?? []
	};
};
type tradeUnit = {
	id: number;
	trade_id: string;
	artist_name: string;
	item_name: string;
	quantity: number;
	total_sales: number;
	discount: number;
	net_sales: number;
	trade_head: {
		state: string;
		trade_id: string;
		trade_date: string;
	};
};
