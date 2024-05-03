import { supabase } from '$lib/db';
import db from '$lib/db';

export const load = async () => {
	const artistData = (await db.GetArtistDataList())?.data;

	return { artistData };
};

export const actions = {
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
