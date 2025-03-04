import db, {
	type TradeBody,
	type TradeHead,
	type TradeHeadRow,
	type TradeBodyRow,
	supabase
} from '$lib/db';

export const savePartToDb = async (tradeBodyList: TradeBody[], tradeHeadList: TradeHead[]) => {
	let newTradeHead: TradeHeadRow[] = [];
	let newTradeBody: TradeBodyRow[] = [];
	{
		const { error, data } = await db.SaveTradeHead(tradeHeadList);
		if (error !== null) {
			return { error, newTradeHead, newTradeBody };
		}
		newTradeHead = data ?? [];
	}
	{
		const { error, data } = await db.SaveTradeBody(tradeBodyList);
		if (error !== null) {
			return { error, newTradeHead, newTradeBody };
		}
		newTradeBody = data ?? [];
	}
	return { error: null, newTradeHead, newTradeBody };
};

export async function getExistingArtists(importedArtist: string[]) {
	const exist_artist = await supabase.from('artist').select().in('artist_name', importedArtist);
	if (exist_artist.error) {
		throw new Error('artist not found');
	}

	return exist_artist;
}
export async function saveNotExistArtist(not_exist_artist: { artist_name: string }[]) {
	const saveArtist = await db.SaveArtist(
		not_exist_artist.map((e) => ({ artist_name: e.artist_name }))
	);
	if (saveArtist.error) {
		throw new Error('artist save error');
	}
}

export async function GetArtistList() {
	const artistList = await db.GetArtistDataList();
	if (artistList.error) {
		throw new Error(artistList.error.message);
	}
	return artistList;
}
