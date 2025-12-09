// this file main perpose is no import supabase for test without supabase key
import { type ImportedTrade, type ImportIndexOfHeader } from './importDTO';
import type { TradeHeadRow } from '$lib/db';

export enum ProcessedStatus {
	NORMAL,
	PROCESSING,
	ERROR,
	PROCESSED
}

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

export async function filterNonExistentArtists(
	importedTrade: { artist_name: string }[],
	exist_artist: { artist_name: string }[]
) {
	const not_exist_artist: { artist_name: string }[] = [];
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
export const GetArtistNameList = (data: { artist_name: string }[]) => {
	let s = new Set<string>();
	data.forEach((e) => {
		s.add(e.artist_name);
	});
	return Array.from(s);
};
