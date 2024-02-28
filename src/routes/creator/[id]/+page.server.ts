import { supabase } from '$lib/db';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const artist_name = await GetArtistName(parseInt(params.id));
	return {
		artist_name,
		id: params.id
	};
};
export const actions = {
	GetTradeData: async ({ request }) => {
		const formData = await request.formData();
		const key = formData.get('password') as string;
		const id = formData.get('id') as string;
		const { data, error } = await supabase
			.from('artist')
			.select('report_key')
			.eq('id', parseInt(id));
		if (error) {
			console.log(error);
		}
		const keyList = data?.map((e) => e.report_key);
		if (!keyList?.includes(key)) {
			return fail(400, { admit: true, tradeData: [] });
		}
		const tradeData = await GetTradeData(id);
		return { admit: true, tradeData };
	}
};
const GetTradeData = async (id: string) => {
	const date = new Date();
	const firstDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1));
	const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
	const { data, error } = await supabase
		.from('trade_body')
		.select('*, trade_head!inner(trade_id, trade_date, state)')
		.gt('trade_head.trade_date', firstDay.toISOString())
		.lt('trade_head.trade_date', lastDay.toISOString())
		.eq('trade_head.state', '關閉')
		.eq('artist_id', id);
	if (error !== null) {
		console.log(error);
	}
	return data;
};
const GetArtistName = async (id: number) => {
	const { data, error } = await supabase.from('artist').select().eq('id', id).maybeSingle();
	if (error !== null) {
		console.error(error);
	}
	if (data === null) {
		return 'not found this artist';
	}
	return data.artist_name;
};
