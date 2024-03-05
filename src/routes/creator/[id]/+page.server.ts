import { supabase, type QueryTradeBodyWithTradeHead } from '$lib/db';
import db from '$lib/db';
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
		const tradeData = await db.GetTradeData(id);
		return { admit: true, tradeData: tradeData.data };
	},
	UpdateTradeData: async ({ request, params }) => {
		const formData = await request.formData();
		const firstDate = formData.get('firstDate') as string;
		const lastDate = formData.get('lastDate') as string;

		const tradeDataList: QueryTradeBodyWithTradeHead = (
			await db.GetTradeData(params.id, {
				firstDate: new Date(firstDate),
				lastDate: new Date(lastDate)
			})
		).data as QueryTradeBodyWithTradeHead;
		const { count } = await db.GetTradeDataCount('*', {
			firstDate: new Date(firstDate),
			lastDate: new Date(lastDate)
		});

		return { tradeDataList: tradeDataList, count };
	}
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
