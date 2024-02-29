import { supabase } from '$lib/db';
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
		return { admit: true, tradeData };
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
