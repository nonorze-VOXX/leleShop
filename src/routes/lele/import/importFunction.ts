import type { Artist, ArtistRow, TradeBody, TradeHead } from '$lib/db';
import db, { supabase } from '$lib/db';
import {
	artistIndex,
	dateIndex,
	discountIndex,
	fileToArray,
	findIndex,
	GetStoreSet,
	GetTradeHeadSet,
	itemNameIndex,
	netIndex,
	quantityIndex,
	stateIndex,
	totalIndex,
	tradeIdIndex
} from './importBase';
import { GetArtistList, getExistingArtists, saveNotExistArtist } from './importDb';
import { Array2DToImportedTrade, type ImportedTrade } from './importDTO';

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
	const { head, body } = await getHeadBody(file);

	const { importedTrade, susTradeIdList } = Array2DToImportedTrade(head, body);
	const importedArtist = GetArtistNameList(importedTrade);
	const not_exist_artist: ImportedTrade[] = await filterNonExistentArtists(
		importedArtist,
		importedTrade
	);

	await saveNotExistArtist(not_exist_artist);

	const artistList = await GetArtistList();
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
	const tradeHeadList = [...tradeHeadSet].map((e) => {
		return e.trade_id;
	});
	const existTradeHead: {
		store_id: number;
		trade_date: string;
		trade_id: string;
	}[] = [];

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

async function filterNonExistentArtists(importedArtist: string[], importedTrade: ImportedTrade[]) {
	const exist_artist = await getExistingArtists(importedArtist);

	return filterNonExistentTrades(importedTrade, exist_artist.data);
}

function filterNonExistentTrades(
	importedTrade: ImportedTrade[],
	exist_artist: {
		artist_name: string;
		id: number;
		report_key: string | null;
		visible: boolean;
	}[]
) {
	const not_exist_artist: ImportedTrade[] = [];
	for (let i = 0; i < importedTrade.length; i++) {
		const e = importedTrade[i];
		if (
			!exist_artist.some((artist) => artist.artist_name === e.artist_name) &&
			!not_exist_artist.some((artist) => artist.artist_name === e.artist_name)
		) {
			not_exist_artist.push(e);
		}
	}
	return not_exist_artist;
}

export async function getHeadBody(file: File) {
	const headBody = await fileToArray(file).then((arr) => {
		const [h, ...b] = arr;
		return { head: h, body: b };
	});
	if (headBody.head === undefined) {
		throw new Error('head format is wrong or file is empty');
	}
	const head = headBody.head;
	const body = headBody.body;
	return { head, body };
}
