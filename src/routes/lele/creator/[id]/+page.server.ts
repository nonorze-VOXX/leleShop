import { type QueryTradeBodyWithTradeHead } from '$lib/db';
import db from '$lib/db';
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
