import type { ArtistWithTradeRow } from '$lib/db';
import { tradeIdIndex, artistIndex, itemNameIndex, quantityIndex, totalIndex, discountIndex, netIndex, dateIndex, storeIndex, stateIndex } from './importBase';

export type ImportedTrade = Omit<
	{
		[K in keyof ArtistWithTradeRow]: NonNullable<ArtistWithTradeRow[K]>;
	}, 'id' | 'artist_id'
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

			if (tradeIdIdx === -1 ||
				artistIdx === -1 ||
				itemNameIdx === -1 ||
				quantityIdx === -1 ||
				totalIdx === -1 ||
				discountIdx === -1 ||
				netIdx === -1 ||
				dateIdx === -1 ||
				storeIdx === -1) {
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

