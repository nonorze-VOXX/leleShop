import { fail } from '@sveltejs/kit';
import db, { type TradeBody, type TradeHead } from '$lib/db';
import { groupBy } from '$lib/function/Utils';
import { GetNewArtistList, GetStoreData, fileToArray, tradeIdIndex } from './importFunction';

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const timezoneOffset = formData.get('dateOffset') as string;

		const files = formData.getAll('fileToUpload');
		if (files.length === 0) {
			return fail(400, {
				error: true,
				message: 'You must provide a file to upload'
			});
		}

		for (let i = 0; i < files.length; i++) {
			const file = files[i] as File;
			const fileArr2D = await fileToArray(file);
			let dataHeader: string[] = [];
			dataHeader = fileArr2D[0];

			const groupByOrder = groupBy(fileArr2D.slice(1), (i) => i[tradeIdIndex(dataHeader)]);

			const tradeIdList = (await db.GetTradeIdList()).data ?? [];
			let artistList = (await db.GetArtistDataList()).data ?? [];
			const newArtistList = GetNewArtistList(artistList, groupByOrder, dataHeader);
			{
				if (newArtistList.length > 0) {
					const { data } = await db.SaveArtistName(newArtistList);
					artistList = artistList.concat(data ?? []);
				}
			}

			const { tradeBodyList, tradeHeadList } = GetStoreData(
				tradeIdList,
				artistList,
				groupByOrder,
				timezoneOffset,
				dataHeader
			);
			const { error } = await savePartToDb(tradeBodyList, tradeHeadList);
			if (error !== null) {
				return false;
			}
		}
		return true;
	}
};

const savePartToDb = async (tradeBodyList: TradeBody[], tradeHeadList: TradeHead[]) => {
	{
		const { error } = await db.SaveTradeHead(tradeHeadList);
		if (error !== null) {
			return { error };
		}
	}
	{
		const { error } = await db.SaveTradeBody(tradeBodyList);
		if (error !== null) {
			return { error };
		}
	}
	return { error: null };
};
