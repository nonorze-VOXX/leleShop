import type { ArtistWithTradeRow } from '$lib/db';

export type ImportedTrade = Omit<
	{
		[K in keyof ArtistWithTradeRow]: NonNullable<ArtistWithTradeRow[K]>;
	},
	'id' | 'artist_id'
>;
export type ImportedTradeWithState = ImportedTrade & { state: string };
export type ImportIndexOfHeader = {
	tradeIdIdx: number;
	artistIdx: number;
	itemNameIdx: number;
	quantityIdx: number;
	totalIdx: number;
	discountIdx: number;
	netIdx: number;
	dateIdx: number;
	storeIdx: number;
	stateIdx: number;
};

export const FilterSusTradeIdList = (importedTradeWithState: ImportedTradeWithState[]) => {
	const susTradeIdList: string[] = [];
	for (const e of importedTradeWithState) {
		if (e.state !== '關閉') {
			susTradeIdList.push(e.trade_id);
		}
	}
	const importedTrade: ImportedTrade[] = importedTradeWithState.filter((e) => e.state === '關閉');
	return { susTradeIdList, importedTrade };
};
