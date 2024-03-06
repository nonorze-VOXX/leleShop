import { fail } from '@sveltejs/kit';
import db from '$lib/db';
import { groupBy } from '$lib/function/Utils';
import { GetNewArtistList, GetStoreData, savePartToDb, tradeIdIndex } from './importFunction';

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

const fileToArray = async (file: File) => {
	const result2D: string[][] = [];
	const text = await file.text();
	const lines = text.split('\n');
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].split('\r')[0];
		const words = line.split(',');
		const result1D: string[] = [];
		for (let ii = 0; ii < words.length; ii++) {
			const word = words[ii] ? words[ii] : '';
			result1D.push(word);
		}
		result2D.push(result1D);
	}
	return result2D;
};
