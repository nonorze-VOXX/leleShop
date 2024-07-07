import db, { supabase } from '$lib/db';
import { arr_sum } from '$lib/function/Utils';

export async function GetTradeTotalDataEachOne(
	firstDate: Date,
	lastDate: Date,
	shop_id: number | '*'
) {
	if (!firstDate || !lastDate) {
		return { error: 'invalid date', result: [] };
	}
	const { data } = await db.GetArtistDataList();
	const artistList = data ?? [];
	const result = await Promise.all(
		artistList?.map(async (artist) => {
			const { net_total } = await db.GetTradeTotal(artist.id, firstDate, lastDate, shop_id);
			return { net_total, artist_name: artist.artist_name };
		})
	);

	return { result, error: null };
}
