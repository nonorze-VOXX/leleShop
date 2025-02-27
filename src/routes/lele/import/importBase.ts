import { GetDateWithTimeZone } from './importFunction';
import { type ImportedTrade, type ImportIndexOfHeader } from './importDTO';
import type { TradeHeadRow } from '$lib/db';
import { getExistingArtists } from './importDb';

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

export const GetStoreId = (store_name: string, storeData: { id: number; store_name: string }[]) => {
	const store = storeData.find((e) => e.store_name === store_name);
	if (store === undefined) {
		throw new Error('store not found');
	}
	return store.id;
};

export const GetStoreSet = (data: ImportedTrade[]) => {
	const storeSet = new Set<string>();

	data.forEach((e) => {
		storeSet.add(e.store_name);
	});
	return storeSet;
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
export const fileToArray = async (file: File): Promise<string[][]> => {
	const text = await file.text();
	return text
		.split('\n')
		.map((line) => line.trim().split(','))
		.filter((words) => words.length > 1 || words[0] !== '');
};
export async function filterNonExistentArtists(
	importedArtist: string[],
	importedTrade: ImportedTrade[]
) {
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
export const GetIndexByHeader = (dataHeader: string[]): ImportIndexOfHeader => {
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
	return {
		tradeIdIdx,
		artistIdx,
		itemNameIdx,
		quantityIdx,
		totalIdx,
		discountIdx,
		netIdx,
		dateIdx,
		storeIdx,
		stateIdx
	};
};
