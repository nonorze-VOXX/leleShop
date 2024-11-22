import type {
	Artist,
	ArtistRow,
	ArtistWithTradeRow,
	TradeBody,
	TradeBodyRow,
	TradeHead,
	TradeHeadRow
} from '$lib/db';
import db from '$lib/db';
import { groupBy } from '$lib/function/Utils';

export const findIndex = (dataHeader: string[], target: string) => {
	return dataHeader.findLastIndex((e) => e === target);
};

export const artistIndex = (dataHeader: string[]) => {
	return findIndex(dataHeader, '類別');
};
export const itemNameIndex = (dataHeader: string[]) => {
	return findIndex(dataHeader, '商品');
};
export const quantityIndex = (dataHeader: string[]) => {
	return findIndex(dataHeader, '數量');
};
export const tradeIdIndex = (dataHeader: string[]) => {
	return findIndex(dataHeader, '收據號碼');
};
export const totalIndex = (dataHeader: string[]) => {
	return findIndex(dataHeader, '銷售總額');
};
export const discountIndex = (dataHeader: string[]) => {
	return findIndex(dataHeader, '折扣');
};
export const netIndex = (dataHeader: string[]) => {
	return findIndex(dataHeader, '淨銷售額');
};
export const stateIndex = (dataHeader: string[]) => {
	return findIndex(dataHeader, '狀態');
};
export const dateIndex = (dataHeader: string[]) => {
	return findIndex(dataHeader, '日期');
};
export const storeIndex = (dataHeader: string[]) => {
	return findIndex(dataHeader, '商店');
};
export const GetNewArtistList = (
	artistList: ArtistRow[],
	groupByIndex: Record<string, string[][]>,
	dataHeader: string[]
) => {
	const newArtistList: Artist[] = [];
	for (const key in groupByIndex) {
		if (key === undefined || key === 'undefined') continue;
		const element = groupByIndex[key];
		for (let i = 0; i < element.length; i++) {
			const artist_name = element[i][artistIndex(dataHeader)];
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

const CheckDataHeader = (dataHeader: string[]) => {
	const shouldDataHeader = [
		'收據號碼',
		'類別',
		'商品',
		'數量',
		'銷售總額',
		'折扣',
		'淨銷售額',
		// '狀態',
		'日期'
	];
	const notFoundColumn: string[] = [];
	shouldDataHeader.forEach((e) => {
		if (findIndex(dataHeader, e) === -1) {
			notFoundColumn.push(e);
		}
	});
	if (notFoundColumn.length > 0) {
		return {
			error: notFoundColumn.join(',') + ', not found'
		};
	}
	return { error: null };
};

export const GetStoreData = (
	tradeIdList: { trade_id: string }[],
	artistList: ArtistRow[],
	groupByIndex: Record<string, string[][]>,
	timezoneOffset: string,
	dataHeader: string[]
) => {
	const { error } = CheckDataHeader(dataHeader);
	if (error) {
		return {
			tradeBodyList: [],
			tradeHeadList: [],
			error
		};
	}
	const tradeBodyList: TradeBody[] = [];
	const tradeHeadList: TradeHead[] = [];
	const susTradeIdList: string[] = [];

	for (const key in groupByIndex) {
		if (key === undefined || key === 'undefined') continue;
		if (tradeIdList.findLastIndex((i) => i.trade_id === key) !== -1) {
			continue;
		}

		const element = groupByIndex[key];
		const date = GetDateWithTimeZone(element[0][dateIndex(dataHeader)], timezoneOffset);
		let state = '關閉';
		if (stateIndex(dataHeader) !== -1) {
			state = element[0][stateIndex(dataHeader)];
		}
		if (state !== '關閉') {
			// todo: return not close trade
			susTradeIdList.push(key);
			continue;
		}
		tradeHeadList.push({
			trade_date: date.toISOString(),
			trade_id: element[0][tradeIdIndex(dataHeader)]
		});

		for (let i = 0; i < element.length; i++) {
			const artist_name = element[i][artistIndex(dataHeader)];
			if (artistList.findLastIndex((artist) => artist.artist_name === artist_name) === -1) {
				console.error('artist not found', artist_name);
			}
			const artist_id = artistList.find((artist) => artist.artist_name === artist_name)?.id;
			if (artist_id === undefined)
				return { error: 'artist not found', tradeBodyList: [], tradeHeadList: [] };

			tradeBodyList.push({
				item_name: element[i][itemNameIndex(dataHeader)],
				quantity: parseInt(element[i][quantityIndex(dataHeader)]),
				trade_id: element[i][tradeIdIndex(dataHeader)],
				total_sales: parseFloat(element[i][totalIndex(dataHeader)]),
				discount: parseFloat(element[i][discountIndex(dataHeader)]),
				net_sales: parseFloat(element[i][netIndex(dataHeader)]),
				artist_id: artist_id
			});
		}
	}
	return { tradeBodyList, tradeHeadList, susTradeIdList };
};

export const fileToArray = async (file: File) => {
	const result2D: string[][] = [];
	const text = await file.text();
	const lines = text.split('\n');
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].split('\r')[0];
		const words = line.split(',');
		const result1D: string[] = [];
		if (words.length === 1 && words[0] === '') {
			continue;
		}
		for (let ii = 0; ii < words.length; ii++) {
			const word = words[ii] ? words[ii] : '';
			result1D.push(word);
		}
		if (result1D.length > 0) {
			result2D.push(result1D);
		}
	}
	return result2D;
};

// dateStr: YYYY-MM-DD HH:MM
export const GetDateWithTimeZone = (dateStr: string, timezoneOffset: string) => {
	if (dateStr.split('+').length == 2) {
		const date = new Date(dateStr);
		return date;
	}
	const date = new Date(dateStr.replace(/ /g, 'T') + timezoneOffset);
	return date;
};
export const GetDateRange = async (
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
export const savePartToDb = async (tradeBodyList: TradeBody[], tradeHeadList: TradeHead[]) => {
	console.log('tradeBodyList', tradeBodyList);
	console.log('tradeHeadList', tradeHeadList);
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

export const f = async (formData: FormData, timezoneOffset: string) => {
	const files = formData.getAll('fileToUpload');
	if (files.length === 0) {
		return { error: 'You must provide a file to upload' };
	}
	let susTradeIdLists: string[] = [];

	for (let i = 0; i < files.length; i++) {
		const file = files[i] as File;
		const fileArr2D = await fileToArray(file);
		let dataHeader: string[] = [];
		dataHeader = fileArr2D[0];
		if (!dataHeader) {
			continue;
		}

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

		const { tradeBodyList, tradeHeadList, susTradeIdList, error } = GetStoreData(
			tradeIdList,
			artistList,
			groupByOrder,
			timezoneOffset,
			dataHeader
		);
		if (error) {
			return { error: error };
		}
		susTradeIdLists = susTradeIdLists.concat(susTradeIdList ?? []);
		const {
			error: saveError,
			newTradeBody,
			newTradeHead
		} = await savePartToDb(tradeBodyList, tradeHeadList);
		if (saveError) {
			return { error: saveError };
		} else {
			return { error: null, newTradeBody, newTradeHead, susTradeIdLists };
		}
	}
	return { error: null, newTradeBody: [], newTradeHead: [], susTradeIdLists };
};

export type ImportedTrade = Omit<
	{
		[K in keyof ArtistWithTradeRow]: NonNullable<ArtistWithTradeRow[K]>;
	},
	'id' | 'artist_id'
>;
export const Array2DToImportedTrade = (dataHeader: string[], data: string[][]) => {
	return data
		.map((e) => {
			const tradeIdIdx = tradeIdIndex(dataHeader);
			const artistIdx = artistIndex(dataHeader);
			const itemNameIdx = itemNameIndex(dataHeader);
			const quantityIdx = quantityIndex(dataHeader);
			const totalIdx = totalIndex(dataHeader);
			const discountIdx = discountIndex(dataHeader);
			const netIdx = netIndex(dataHeader);
			const dateIdx = dateIndex(dataHeader);
			const storeIdx = storeIndex(dataHeader);

			if (
				tradeIdIdx === -1 ||
				artistIdx === -1 ||
				itemNameIdx === -1 ||
				quantityIdx === -1 ||
				totalIdx === -1 ||
				discountIdx === -1 ||
				netIdx === -1 ||
				dateIdx === -1 ||
				storeIdx === -1
			) {
				return undefined;
			}
			const dateStr = e[dateIdx];
			let date;
			if (dateStr.split('+').length == 2) {
				date = new Date(dateStr);
			} else {
				date = new Date(dateStr + '+08');
			}

			const result: ImportedTrade = {
				trade_id: e[tradeIdIdx],
				artist_name: e[artistIdx],
				item_name: e[itemNameIdx],
				quantity: parseInt(e[quantityIdx]),
				total_sales: parseFloat(e[totalIdx]),
				discount: parseFloat(e[discountIdx]),
				net_sales: parseFloat(e[netIdx]),
				trade_date: date.toISOString(),
				store_name: e[storeIdx]
			};
			return result;
		})
		.filter((e) => e !== undefined);
};

export const GetArtistNameSet = (data: ImportedTrade[]) => {
	const artistNameSet = new Set<string>();
	data.forEach((e) => {
		artistNameSet.add(e.artist_name);
	});
	return artistNameSet;
};

export const GetTradeHeadSet = (data: ImportedTrade[]) => {
	const tradeHeadSet = new Set<TradeHead>();

	data.forEach((e) => {
		const next = {
			trade_id: e.trade_id,
			trade_date: e.trade_date
		};
		if (
			![...tradeHeadSet].some(
				(tradeHead) =>
					tradeHead.trade_id === next.trade_id && tradeHead.trade_date === next.trade_date
			)
		)
			tradeHeadSet.add(next);
	});
	return tradeHeadSet;
};
