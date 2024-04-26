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

export const actions = {};
