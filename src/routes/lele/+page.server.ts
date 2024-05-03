import { supabase } from '$lib/db';
import db from '$lib/db';
import { randomNumber } from '$lib/function/Utils';

export const load = async () => {
	const artistData = (await db.GetArtistDataList())?.data;

	return { artistData };
};

export const actions = {
	UpdateReportKey: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const random = randomNumber(5);
		const { data, error } = await supabase
			.from('artist')
			.update({ report_key: random })
			.eq('id', id)
			.select()
			.single();

		if (error) {
			console.error(error);
		}

		const key = data?.report_key;
		return { key };
	},

	UpdateArtistVisible: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const visible = formData.get('visible') === 'true' ? true : false;
		const { data, error } = await supabase.from('artist').update({ visible }).eq('id', id).select();

		if (error) {
			console.error(error);
		}

		return { data };
	}
};
