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

export const Array2DToImportedTrade = (
	importIndexOfHeader: ImportIndexOfHeader,
	data: string[][]
) => {
	const {
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
	} = importIndexOfHeader;
	const importedTrade = data
		.map((e) => {
			// if (stateIdx !== -1 && e[stateIdx] !== '關閉') {
			// 	susTradeIdList.push(e[tradeIdIdx]);
			// 	return;
			// }
			const dateStr = e[dateIdx];
			let date;
			if (dateStr.split('+').length == 2) {
				date = new Date(dateStr);
			} else {
				date = new Date(dateStr + '+08');
			}

			const result: ImportedTradeWithState = {
				trade_id: e[tradeIdIdx],
				artist_name: e[artistIdx],
				item_name: e[itemNameIdx],
				quantity: parseInt(e[quantityIdx]),
				total_sales: parseFloat(e[totalIdx]),
				discount: parseFloat(e[discountIdx]),
				net_sales: parseFloat(e[netIdx]),
				trade_date: date.toISOString(),
				store_name: e[storeIdx],
				state: stateIdx !== -1 ? e[stateIdx] : '關閉'
			};
			return result;
		})
		.filter((e) => e !== undefined);

	return importedTrade;
	// , susTradeIdList: Array.of(...new Set(susTradeIdList))
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
