import { describe, expect, it } from 'vitest';
import {
	Array2DToImportedTrade,
	FilterSusTradeIdList,
	type ImportedTradeWithState
} from './importDTO';
import { StringToArray } from './importBase';

describe('importDTO', () => {
	const importIndexOfHeader = {
		tradeIdIdx: 1,
		artistIdx: 3,
		itemNameIdx: 5,
		quantityIdx: 8,
		totalIdx: 9,
		discountIdx: 10,
		netIdx: 11,
		dateIdx: 0,
		storeIdx: 16,
		stateIdx: 21
	};
	const testTradeRow: ImportedTradeWithState[] = [
		{
			artist_name: 'artist_random_id artist_name',

			item_name: 'item_name',
			quantity: 1,
			total_sales: 150,
			discount: 0,
			net_sales: 150,
			trade_date: '2024-07-08T15:03:00.000Z',
			trade_id: '2-1022',
			store_name: 'The shop2',
			state: '關閉'
		},
		{
			artist_name: 'artist_random_id artist_name',
			item_name: 'item_name',
			quantity: 1,
			total_sales: 150,
			discount: 0,
			net_sales: 150,
			trade_date: '2024-07-08T15:03:00.000Z',
			trade_id: '2-1022',
			store_name: 'The shop1',
			state: '關閉'
		}
	];
	it('array 2d to import trade have same id', async () => {
		// UTC+8 timezone test
		const context =
			// '日期,收據號碼,收據類型,類別,SKU,商品,變體,修飾符已应用的,數量,銷售總額,折扣,淨銷售額,銷售成本,毛利潤,稅務,POS,商店,收銀員名稱,客戶名稱,客戶聯繫電話,註釋,狀態\n' +
			'2024-07-08 23:03+8,2-1022,銷售,artist_random_id artist_name,sku,item_name,,,1.000,150.00,0.00,150.00,0.00,150.00,0.00,POS 2,The shop2,,,,,關閉\n\n' +
			'2024-07-08 23:03,2-1022,銷售,artist_random_id artist_name,sku,item_name,,,1.000,150.00,0.00,150.00,0.00,150.00,0.00,POS 2,The shop1,,,,,關閉\n\n';

		const body = StringToArray(context);
		const result = Array2DToImportedTrade(importIndexOfHeader, body);
		expect(result).toStrictEqual(testTradeRow);
	});
	it('array 2d to imported trade with diff id', async () => {
		// UTC+8 timezone test
		const context =
			'2024-07-08 23:03+8,2-1022,銷售,artist_random_id artist_name,sku,item_name,,,1.000,150.00,0.00,150.00,0.00,150.00,0.00,POS 2,The shop2,,,,,關閉\n\n' +
			'2024-07-08 23:03,2-1023,銷售,artist_random_id artist_name,sku,item_name,,,1.000,150.00,0.00,150.00,0.00,150.00,0.00,POS 2,The shop1,,,,,關閉\n\n';

		const body = StringToArray(context);
		const importedTrade = Array2DToImportedTrade(importIndexOfHeader, body);
		expect(importedTrade).toStrictEqual([
			{
				artist_name: 'artist_random_id artist_name',
				item_name: 'item_name',
				quantity: 1,
				total_sales: 150,
				discount: 0,
				net_sales: 150,
				trade_date: '2024-07-08T15:03:00.000Z',
				trade_id: '2-1022',
				store_name: 'The shop2',
				state: '關閉'
			},
			{
				artist_name: 'artist_random_id artist_name',
				item_name: 'item_name',
				quantity: 1,
				total_sales: 150,
				discount: 0,
				net_sales: 150,
				trade_date: '2024-07-08T15:03:00.000Z',
				trade_id: '2-1023',
				store_name: 'The shop1',
				state: '關閉'
			}
		]);
	});

	it('filter sus trade filter state is not close', async () => {
		// UTC+8 timezone test
		const context =
			// '日期,收據號碼,收據類型,類別,SKU,商品,變體,修飾符已应用的,數量,銷售總額,折扣,淨銷售額,銷售成本,毛利潤,稅務,POS,商店,收銀員名稱,客戶名稱,客戶聯繫電話,註釋,狀態\n' +
			'2024-07-08 23:03+8,2-1022,銷售,artist_random_id artist_name,sku,item_name,,,1.000,150.00,0.00,150.00,0.00,150.00,0.00,POS 2,The shop2,,,,,關閉\n\n' +
			'2024-07-08 23:03+8,2-1023,銷售,artist_random_id artist_name,sku,item_name,,,1.000,150.00,0.00,150.00,0.00,150.00,0.00,POS 2,The shop2,,,,,取消\n\n' +
			'2024-07-08 23:03,2-1022,銷售,artist_random_id artist_name,sku,item_name,,,1.000,150.00,0.00,150.00,0.00,150.00,0.00,POS 2,The shop1,,,,,關閉\n\n';

		const body = StringToArray(context);
		const { importedTrade, susTradeIdList } = FilterSusTradeIdList(
			Array2DToImportedTrade(importIndexOfHeader, body)
		);

		expect(importedTrade).toStrictEqual(testTradeRow);
		expect(susTradeIdList).toStrictEqual(['2-1023']);
	});
});
