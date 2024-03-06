import { fail } from '@sveltejs/kit';
import db, { type Artist, type ArtistRow } from '$lib/db';
import { type TradeBody, type TradeHead } from '$lib/db';
import { groupBy } from '$lib/function/Utils';

let dataHeader: string[] = [];
const findIndex = (target: string) => {
	return dataHeader.findLastIndex((e) => e === target);
};

const artistIndex = () => {
	return findIndex('類別');
};
const itemNameIndex = () => {
	return findIndex('商品');
};
const quantityIndex = () => {
	return findIndex('數量');
};
const tradeIdIndex = () => {
	return findIndex('收據號碼');
};
const totalIndex = () => {
	return findIndex('銷售總額');
};
const discountIndex = () => {
	return findIndex('折扣');
};
const netIndex = () => {
	return findIndex('淨銷售額');
};
const stateIndex = () => {
	return findIndex('狀態');
};
const dateIndex = () => {
	return findIndex('日期');
};

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
			dataHeader = fileArr2D[0];

			const groupByOrder = groupBy(fileArr2D.slice(1), (i) => i[tradeIdIndex()]);

			const tradeIdList = (await db.GetTradeIdList()).data ?? [];
			let artistList = (await db.GetArtistDataList()).data ?? [];
			const newArtistList = GetNewArtistList(artistList, groupByOrder);
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
				timezoneOffset
			);
			const { error } = await savePartToDb(tradeBodyList, tradeHeadList);
			if (error !== null) {
				return false;
			}
		}
		return true;
	}
};
const GetNewArtistList = (artistList: ArtistRow[], groupByIndex: Record<string, string[][]>) => {
	const newArtistList: Artist[] = [];
	for (const key in groupByIndex) {
		if (key === undefined || key === 'undefined') continue;
		const element = groupByIndex[key];
		for (let i = 0; i < element.length; i++) {
			const artist_name = element[i][artistIndex()];
			if (
				artistList.findLastIndex((artist) => artist.artist_name === artist_name) === -1 &&
				newArtistList.findLastIndex((artist) => artist.artist_name === artist_name) === -1
			) {
				newArtistList.push({ artist_name });
			}
		}
	}
	return newArtistList;
};

const GetStoreData = (
	tradeIdList: { trade_id: string }[],
	artistList: ArtistRow[],
	groupByIndex: Record<string, string[][]>,
	timezoneOffset: string
) => {
	const tradeBodyList: TradeBody[] = [];
	const tradeHeadList: TradeHead[] = [];

	for (const key in groupByIndex) {
		if (key === undefined || key === 'undefined') continue;
		if (tradeIdList.findLastIndex((i) => i.trade_id === key) !== -1) {
			console.log('DB had it');
			continue;
		}

		const element = groupByIndex[key];
		const date = new Date(element[0][dateIndex()].replace(/ /g, 'T') + timezoneOffset);

		tradeHeadList.push({
			trade_date: date.toISOString(),
			trade_id: element[0][tradeIdIndex()],
			state: element[0][stateIndex()]
		});

		for (let i = 0; i < element.length; i++) {
			const artist_name = element[i][artistIndex()];
			if (artistList.findLastIndex((artist) => artist.artist_name === artist_name) === -1) {
				console.error('artist not found', artist_name);
			}
			const artist_id = artistList.find((artist) => artist.artist_name === artist_name)?.id;

			tradeBodyList.push({
				item_name: element[i][itemNameIndex()],
				quantity: parseInt(element[i][quantityIndex()]),
				trade_id: element[i][tradeIdIndex()],
				total_sales: parseFloat(element[i][totalIndex()]),
				discount: parseFloat(element[i][discountIndex()]),
				net_sales: parseFloat(element[i][netIndex()]),
				artist_id: parseInt(artist_id as unknown as string)
			});
		}
	}
	return { tradeBodyList, tradeHeadList };
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
