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
		.eq('trade_head.state', '關閉')
		.eq('artist_id', params.id);
	console.log(data);
	if (error !== null) {
		console.log(error);
	}
	const tradeData = data;
	const artist_name = await GetArtistName(parseInt(params.id));
	return {
		data: tradeData ?? [],
		artist_name
	};
};
const GetArtistName = async (id: number) => {
	const { data, error } = await supabase.from('artist').select().eq('id', id);
	if (error !== null) {
		console.log(error);
	}
	console.log(data);
	if (data === null || data.length === 0) {
		return 'not found this artist';
	}
	return data[0].artist_name;
};
