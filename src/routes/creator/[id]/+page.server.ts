import { supabase, type QueryTradeBodyWithTradeHead } from '$lib/db';
import db from '$lib/db';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const artist_data = (await db.GetArtistData(params.id)).data ?? [];
	const artist_name =
		artist_data.length !== 0 ? artist_data[0].artist_name : 'not found this artist';
	return {
		artist_name,
		id: params.id
	};
};

export const actions = {
	VerifyPassword: async ({ request }) => {
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
		return {};
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
