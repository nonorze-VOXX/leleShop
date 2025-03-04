import type { TradeBody } from '$lib/db';
import db, { supabase } from '$lib/db';
import {
	filterNonExistentArtists,
	GetArtistNameList,
	getHeadBody,
	GetIndexByHeader,
	GetStoreSet,
	GetTradeHeadSet
} from './importBase';
import { GetArtistList, getExistingArtists, saveNotExistArtist } from './importDb';
import { Array2DToImportedTrade, FilterSusTradeIdList, type ImportedTrade } from './importDTO';

export const ProcessFile = async (file: File) => {
	const { head, body } = await getHeadBody(file);

	// check header is ok
	// if not ok will throw error
	const importIndexOfHeader = GetIndexByHeader(head);

	const { importedTrade, susTradeIdList } = FilterSusTradeIdList(
		Array2DToImportedTrade(importIndexOfHeader, body)
	);
	const importedArtist = GetArtistNameList(importedTrade);
	const exist_artist = await getExistingArtists(importedArtist);

	const not_exist_artist: ImportedTrade[] = await filterNonExistentArtists(
		importedTrade,
		exist_artist.data
	);

	await saveNotExistArtist(not_exist_artist);

	await PreInsertStores(importedTrade);
	const storeData = await GetStoreDataFromDb();

	const noDupTradeHead = await BiggerGetNoDupTradeHead(importedTrade, storeData);

	const saveHead = await db.SaveTradeHead(noDupTradeHead);
	if (saveHead.error) {
		throw new Error(saveHead.error.message);
	}

	const artistList = await GetArtistList();
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

async function BiggerGetNoDupTradeHead(
	importedTrade: ImportedTrade[],
	storeData: { created_at: string; id: number; store_name: string }[]
) {
	const tradeHeadSet = GetTradeHeadSet(importedTrade, storeData ?? []);
	const tradeHeadList = [...tradeHeadSet].map((e) => {
		return e.trade_id;
	});
	const noDupTradeHead = await GetNoDupTradeHead(tradeHeadList, tradeHeadSet);
	return noDupTradeHead;
}

async function GetStoreDataFromDb() {
	const storeData = await supabase.from('store').select();
	if (storeData.error) {
		throw new Error(storeData.error.message);
	}
	return storeData.data;
}

async function PreInsertStores(importedTrade: ImportedTrade[]) {
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

async function GetNoDupTradeHead(
	tradeHeadList: string[],
	tradeHeadSet: Set<{ store_id: number; trade_date: string; trade_id: string }>
) {
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
	return noDupTradeHead;
}
