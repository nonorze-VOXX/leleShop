import { fail } from '@sveltejs/kit';
import db, { type TradeBody, type TradeHead } from '$lib/db';
import { groupBy } from '$lib/function/Utils';
import {
	GetDateWithTimeZone,
	GetNewArtistList,
	GetStoreData,
	dateIndex,
	fileToArray,
	tradeIdIndex
} from './importFunction';

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
		let newTradeBodyList: TradeBody[] = [];

		let newTradeHeadList: TradeHead[] = [];

		for (let i = 0; i < files.length; i++) {
			const file = files[i] as File;
			const fileArr2D = await fileToArray(file);
			let dataHeader: string[] = [];
			dataHeader = fileArr2D[0];

			const groupByOrder = groupBy(fileArr2D.slice(1), (i) => i[tradeIdIndex(dataHeader)]);
			const { maxDate, minDate } = await GetDateRange(groupByOrder, dataHeader, timezoneOffset);

			const tradeIdList =
				(await db.GetTradeIdList({ firstDate: minDate, lastDate: maxDate })).data ?? [];
			let artistList = (await db.GetArtistDataList()).data ?? [];
			const newArtistList = GetNewArtistList(artistList, groupByOrder, dataHeader);
			{
				if (newArtistList.length > 0) {
					const { data } = await db.SaveArtistName(newArtistList);
					artistList = artistList.concat(data ?? []);
				}
			}

			console.log(tradeIdList);
			const { tradeBodyList, tradeHeadList } = GetStoreData(
				tradeIdList,
				artistList,
				groupByOrder,
				timezoneOffset,
				dataHeader
			);
			newTradeBodyList = newTradeBodyList.concat(tradeBodyList);
			newTradeHeadList = newTradeHeadList.concat(tradeHeadList);

			const { error } = await savePartToDb(tradeBodyList, tradeHeadList);
			if (error !== null) {
				return { error, tradeHeadList, tradeBodyList };
			}
		}
		return { error: null, newTradeHeadList, newTradeBodyList };
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
const GetDateRange = async (
	groupByOrder: Record<string, string[][]>,
	dataHeader: string[],
	timezoneOffset: string
) => {
	let minDate: Date | null = null;
	let maxDate: Date | null = null;
	for (const key in groupByOrder) {
		if (key === undefined || key === 'undefined') continue;
		const tradeDate = groupByOrder[key][0][dateIndex(dataHeader)];
		const date = GetDateWithTimeZone(tradeDate, timezoneOffset);
		if (minDate === null) {
			minDate = date;
		}
		if (maxDate === null) {
			maxDate = date;
		}
		if (date < minDate) {
			minDate = date;
		}
		if (date > maxDate) {
			maxDate = date;
		}
	}
	return { minDate, maxDate };
};
