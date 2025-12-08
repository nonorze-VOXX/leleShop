import { describe, it, expect } from 'vitest';
import { getHeadBody } from './importBase';
import { GetArtistNameList } from './importBase';
import { GetTradeHeadSet, GetIndexByHeader, StringToArray } from './importBase';
import type { ImportedTradeWithState } from './importDTO';
import { ParseFileToRawImportTrade } from './importFunction';

describe('new importFunction', () => {
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
	const storeData: { id: number; store_name: string }[] = [
		{
			id: 1,
			store_name: 'The shop1'
		},
		{
			id: 2,
			store_name: 'The shop2'
		}
	];
	it('get head body from file', async () => {
		const context = '1,2,3,4\n1,2,3,4';
		const file = new File([context], 'filename');
		const result = await getHeadBody(file);
		expect(result).toStrictEqual({ head: ['1', '2', '3', '4'], body: [['1', '2', '3', '4']] });
	});

	describe('GetIndexByHeader', () => {
		it('get index by header ok', async () => {
			// UTC+8 timezone test
			const context =
				'期,據號碼,收據類型,類別,SKU,商品,變體,修飾符已应用的,數量,銷售總額,折扣,淨銷售額,銷售成本,毛利潤,稅務,POS,商店,收銀員名稱,客戶名稱,客戶聯繫電話,註釋,狀態\n';
			const contextArr = await StringToArray(context);

			const dataHeader = contextArr[0];

			// const {importedTrade, susTradeIdList} =
			expect(() => GetIndexByHeader(dataHeader)).toThrowError();
			// expect(res).toStrictEqual(expectTradeRow);
		});
		it('get index by header ok', async () => {
			// UTC+8 timezone test
			const context =
				'日期,收據號碼,收據類型,類別,SKU,商品,變體,修飾符已应用的,數量,銷售總額,折扣,淨銷售額,銷售成本,毛利潤,稅務,POS,商店,收銀員名稱,客戶名稱,客戶聯繫電話,註釋,狀態\n';
			const contextArr = await StringToArray(context);

			const dataHeader = contextArr[0];

			expect(GetIndexByHeader(dataHeader)).toEqual({
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
			});
		});
	});
	it('get artist name set in imported trade', async () => {
		const artistSet = GetArtistNameList(testTradeRow);
		expect(artistSet).toStrictEqual(['artist_random_id artist_name']);
	});
	it('get trade head in imported trade', () => {
		const tradeHeadList = GetTradeHeadSet(testTradeRow, storeData);

		expect(tradeHeadList).toStrictEqual(
			new Set([
				{
					store_id: 2,
					trade_date: '2024-07-08T15:03:00.000Z',
					trade_id: '2-1022'
				}
			])
		);
	});
});

describe('ProcessFile', () => {
	it('wonderful', async () => {
		const context = 'one,two,three,four\n1,2,3,4';
		const file = new File([context], 'filename');
		const text = await file.text();
		const result = await ParseFileToRawImportTrade(text);
		expect(result).toStrictEqual([{ one: '1', two: '2', three: '3', four: '4' }]);
	});
	it('test with chinese header', async () => {
		const context =
			'類別,商品,數量,收據號碼,銷售總額,折扣,淨銷售額,狀態,日期,商店\n' +
			'artist_random_id artist_name,item_name,1,2-1022,150,0,150,關閉,2024-07-08T15:03:00.000Z,The shop2';
		const file = new File([context], 'filename');
		const text = await file.text();
		const result = await ParseFileToRawImportTrade(text);
		expect(result).toStrictEqual([
			{
				artist_name: 'artist_random_id artist_name',
				item_name: 'item_name',
				quantity: 1,
				trade_id: '2-1022',
				total_sales: 150,
				discount: 0,
				net_sales: 150,
				state: '關閉',
				trade_date: '2024-07-08T15:03:00.000Z',
				store_name: 'The shop2'
			}
		]);
	});
	it('only header', async () => {
		const file = new File(['item_name,total_sales'], 'filename');
		const text = await file.text();
		const result = await ParseFileToRawImportTrade(text);
		expect(result).toStrictEqual([]);
	});
	it('empty file papaparse', async () => {
		const file = new File([], 'filename');
		const text = await file.text();
		await expect(ParseFileToRawImportTrade(text)).rejects.toThrow();
	});
	it('real test', async () => {
		const context =
			'日期,收據號碼,收據類型,類別,SKU,商品,變體,修飾符已应用的,數量,銷售總額,折扣,淨銷售額,銷售成本,毛利潤,稅務,POS,商店,收銀員名稱,客戶名稱,客戶聯繫電話,註釋,狀態\n' +
			'2024-12-02 22:53,6-1153,銷售,14 artist,1407,150 飲料杯袋(有袋底)雙面,,,1.000,150.00,0.00,150.00,0.00,150.00,0.00,POS 2,vonka,,,,,關閉';
		const file = new File([context], 'filename');
		const text = await file.text();
		const result = await ParseFileToRawImportTrade(text);
		expect(result).toStrictEqual([
			{
				POS: 'POS 2',
				SKU: '1407',
				trade_date: '2024-12-02 22:53',
				trade_id: '6-1153',
				artist_name: '14 artist',
				item_name: '150 飲料杯袋(有袋底)雙面',
				quantity: 1,
				total_sales: 150,
				discount: 0,
				net_sales: 150,
				state: '關閉',
				store_name: 'vonka',
				修飾符已应用的: '',
				客戶名稱: '',
				客戶聯繫電話: '',
				收據類型: '銷售',
				收銀員名稱: '',
				毛利潤: '150.00',
				稅務: '0.00',
				註釋: '',
				變體: '',
				銷售成本: '0.00'
			}
		]);
	});
	it('empty file', async () => {
		const file = new File([], 'filename');
		await expect(getHeadBody(file)).rejects.toThrowError();
	});
	it('only header', async () => {
		const context = '1,2,3,4\n';
		const file = new File([context], 'filename');
		expect(await getHeadBody(file)).toStrictEqual({ head: ['1', '2', '3', '4'], body: [] });
	});
});
