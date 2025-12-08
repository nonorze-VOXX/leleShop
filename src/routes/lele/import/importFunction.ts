import type { TradeBody } from '$lib/db';
import { supabase } from '$lib/db';
import Papa from 'papaparse';
import {
	filterNonExistentArtists,
	GetArtistNameList,
	getHeadBody,
	GetIndexByHeader,
	GetStoreSet,
	GetTradeHeadSet
} from './importBase';
import {
	GetArtistAliasList,
	getExistingArtists,
	GetNoDupTradeHead,
	saveNotExistArtist,
	SaveTradeBody,
	SaveTradeHead
} from './importDb';
import { FilterSusTradeIdList, type ImportedTrade, type ImportedTradeWithState } from './importDTO';

export const ProcessFile = async (file: File) => {
	const RawImportTrade: ImportedTradeWithState[] = await ParseFileToRawImportTrade(file);
	const { importedTrade: importingTrade, susTradeIdList } = FilterSusTradeIdList(RawImportTrade);

	const importedArtist = GetArtistNameList(importingTrade);
	const exist_artist = await getExistingArtists(importedArtist);

	const not_exist_artist: { artist_name: string }[] = await filterNonExistentArtists(
		importingTrade,
		exist_artist.data.map((e) => ({ artist_name: e.artist_alias }))
	);

	await saveNotExistArtist(not_exist_artist);

	await PreInsertStores(importingTrade);
	const storeData = await GetStoreDataFromDb();

	const tradeHeadSet = GetTradeHeadSet(importingTrade, storeData ?? []);
	const noDupTradeHead = await GetNoDupTradeHead(tradeHeadSet);

	const saveHead = await SaveTradeHead(noDupTradeHead);
	if (saveHead.error) {
		throw new Error(saveHead.error.message);
	}

	const artistNameList: string[] = Array.from(
		importingTrade.reduce((pre, e) => pre.add(e.artist_name), new Set<string>())
	);
	const artistNameIdMap = await GetArtistAliasList(artistNameList);
	const tradeBodyList: TradeBody[] = importingTrade
		.map((e) => {
			const artist_id = artistNameIdMap.find(
				(artist) => artist.artist_alias === e.artist_name
			)?.artist_id;
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
	const saveBody = await SaveTradeBody(tradeBodyList);
	if (saveBody.error) {
		throw new Error(saveBody.error.message);
	}
	return {
		newHeadCount: (saveHead.data ?? []).length,
		newBodyCount: (saveBody.data ?? []).length,
		susTradeIdList
	};
};

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
export async function ParseFileToRawImportTrade(
	file: File | string
): Promise<ImportedTradeWithState[]> {
	let text = typeof file === 'string' ? file : await file.text();
	let presult = Papa.parse(text, {
		header: true,
		skipEmptyLines: 'greedy',
		transformHeader: (header: string) => {
			const headerMap: Record<string, string> = {
				類別: 'artist_name',
				商品: 'item_name',
				數量: 'quantity',
				收據號碼: 'trade_id',
				銷售總額: 'total_sales',
				折扣: 'discount',
				淨銷售額: 'net_sales',
				狀態: 'state',
				日期: 'trade_date',
				商店: 'store_name'
			};
			return headerMap[header] || header;
		},
		transform: (value: string, header: string) => {
			if (
				header === 'quantity' ||
				header === 'total_sales' ||
				header === 'discount' ||
				header === 'net_sales'
			) {
				return parseFloat(value);
			}
			return value;
		}
	});
	if (presult.errors.length > 0) {
		throw new Error(
			'(可能傳到空檔案)Parse error: ' + presult.errors.map((e) => e.message).join('; ')
		);
	}
	return presult.data as ImportedTradeWithState[];
}
