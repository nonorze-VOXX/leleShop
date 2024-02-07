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

	return {
		data: data ?? []
	};
};
