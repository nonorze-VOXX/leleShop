import type {
	Artist,
	ArtistRow,
	ArtistWithTradeRow,
	TradeBody,
	TradeHead,
	TradeHeadRow
} from '$lib/db';
import db, { supabase } from '$lib/db';
import { artistIndex, findIndex, dateIndex, stateIndex, tradeIdIndex, itemNameIndex, quantityIndex, totalIndex, discountIndex, netIndex, storeIndex, GetStoreId, GetStoreSet } from './importBase';

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
export const ProcessFile = async (file: File) => {
	const headBody = await fileToArray(file).then((file) => {
		return SplitToHeaderBody(file);
	});
	if (headBody.head === undefined) {
		throw new Error('head format is wrong or file is empty');
	}
	const head = headBody.head;
	const body = headBody.body;

	const { importedTrade, susTradeIdList } = Array2DToImportedTrade(head, body);
	const importedArtist = GetArtistNameList(importedTrade);
	const exist_artist = await supabase.from('artist').select().in('artist_name', importedArtist);

	if (exist_artist.error) {
		throw new Error('artist not found');
	}

	const not_exist_artist: ImportedTrade[] = [];
	for (let i = 0; i < importedTrade.length; i++) {
		const e = importedTrade[i];
		if (
			!exist_artist.data.some((artist) => artist.artist_name === e.artist_name) &&
			!not_exist_artist.some((artist) => artist.artist_name === e.artist_name)
		) {
			not_exist_artist.push(e);
		}
	}

	const saveArtist = await db.SaveArtist(
		not_exist_artist.map((e) => ({ artist_name: e.artist_name }))
	);
	if (saveArtist.error) {
		throw new Error('artist save error');
	}

	const artistList = await db.GetArtistDataList();
	if (artistList.error) {
		throw new Error(artistList.error.message);
	}
	{
		const storePreData = await supabase.from('store').select();
		if (storePreData.error) {
			throw new Error(storePreData.error.message);
		}

		const storeSet = GetStoreSet(importedTrade);
		const notExistStore = [...storeSet].filter((e) => {
			return !storePreData.data.some((store) => store.store_name === e);
		});
		const saveStore = await supabase
			.from('store')
			.insert(
				notExistStore.map((e) => {
					return { store_name: e };
				})
			)
			.select();
		if (saveStore.error) {
			throw new Error(saveStore.error.message);
		}
	}
	const storeData = await supabase.from('store').select();
	if (storeData.error) {
		throw new Error(storeData.error.message);
	}

	const tradeHeadSet = GetTradeHeadSet(importedTrade, storeData.data ?? []);
	const existTradeHead: {
		store_id: number;
		trade_date: string;
		trade_id: string;
	}[] = [];
	const tradeHeadList = [...tradeHeadSet].map((e) => {
		return e.trade_id;
	});

	const partLen = 300;
	for (let i = 0; i < tradeHeadList.length; i += partLen) {
		const existTradeHeadPart = await supabase
			.from('trade_head')
			.select()
			.in('trade_id', tradeHeadList.slice(i, i + partLen));
		if (existTradeHeadPart.error) {
			throw new Error(existTradeHeadPart.error.message);
		} else {
			// existTradeHead += existTradeHeadPart.data??[];
			existTradeHeadPart.data?.forEach((e) => {
				existTradeHead.push(e);
			});
		}
	}

	const noDupTradeHead = [...tradeHeadSet].filter((e) => {
		return !existTradeHead.some((tradeHead) => tradeHead.trade_id === e.trade_id);
	});

	const saveHead = await db.SaveTradeHead(noDupTradeHead);
	if (saveHead.error) {
		throw new Error(saveHead.error.message);
	}
	const tradeBodyList: TradeBody[] = importedTrade
		.map((e) => {
			const al = artistList.data ?? [];
			const artist_id = al.find((artist) => artist.artist_name === e.artist_name)?.id;
			if (artist_id === undefined) {
				throw new Error('artist not found');
			}
			return {
				artist_id: artist_id,
				item_name: e.item_name,
				quantity: e.quantity,
				total_sales: e.total_sales,
				discount: e.discount,
				net_sales: e.net_sales,
				trade_id: e.trade_id
			};
		})
		.filter((e) => noDupTradeHead.some((h) => h.trade_id === e.trade_id));
	const saveBody = await db.SaveTradeBody(tradeBodyList);
	if (saveBody.error) {
		throw new Error(saveBody.error.message);
	}
	return {
		newHeadCount: (saveHead.data ?? []).length,
		newBodyCount: (saveBody.data ?? []).length,
		susTradeIdList
	};
};

const SplitToHeaderBody = (context: string[][]) => {
	const b = context;
	const head = b.shift();
	return { head, body: b };
};

export type ImportedTrade = Omit<
	{
		[K in keyof ArtistWithTradeRow]: NonNullable<ArtistWithTradeRow[K]>;
	},
	'id' | 'artist_id'
>;
export const Array2DToImportedTrade = (dataHeader: string[], data: string[][]) => {
	const susTradeIdList: string[] = [];
	const importedTrade = data
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
			const stateIdx = stateIndex(dataHeader);

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
				throw new Error('header is wrong');
			}
			if (stateIdx !== -1) {
				if (e[stateIdx] !== '關閉') {
					susTradeIdList.push(e[tradeIdIdx]);
					return;
				}
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

	return { importedTrade, susTradeIdList: Array.of(...new Set(susTradeIdList)) };
};

export const GetArtistNameList = (data: ImportedTrade[]) => {
	const artistNameSet: string[] = [];
	data.forEach((e) => {
		if (artistNameSet.some((artistName) => artistName === e.artist_name)) {
			return;
		}
		artistNameSet.push(e.artist_name);
	});
	return artistNameSet;
};

export const GetTradeHeadSet = (
	data: ImportedTrade[],
	storeData: { id: number; store_name: string }[]
) => {
	const tradeHeadSet = new Set<TradeHeadRow>();

	data.forEach((e) => {
		const next = {
			trade_id: e.trade_id,
			trade_date: e.trade_date,
			store_id: GetStoreId(e.store_name, storeData)
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


