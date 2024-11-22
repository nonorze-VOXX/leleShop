import { describe, it, expect } from 'vitest';
import {
	Array2DToImportedTrade,
	GetArtistNameSet,
	GetDateWithTimeZone,
	GetNewArtistList,
	GetStoreData,
	GetTradeHeadSet,
	fileToArray,
	type ImportedTrade
} from './importFunction';
import type { ArtistRow, ArtistViewRow, ArtistWithTradeRow, TradeBodyRow } from '$lib/db';

describe('importFunction', () => {
	it.each([
		{
			context: '1,2,3,4\n1,2,3,4',
			answer: [
				['1', '2', '3', '4'],
				['1', '2', '3', '4']
			]
		},
		{ context: '\n1,2,3,4', answer: [['1', '2', '3', '4']] },
		{
			context: '1,2,3,4\n1,2,3',
			answer: [
				['1', '2', '3', '4'],
				['1', '2', '3']
			]
		},
		{
			context: '1,,3,4\n1,2,3',
			answer: [
				['1', '', '3', '4'],
				['1', '2', '3']
			]
		}
	])('fileToArray($context)', async ({ context, answer }) => {
		const file = new File([context], 'filename');

		const result = await fileToArray(file);
		expect(result).toStrictEqual(answer);
	});
	it.each([
		{
			artistList: [{ artist_name: 'artist_name', id: 10 }],
			groupByIndex: { trade_id: [['id', 'artist_name']] },
			dataHeader: ['收據號碼', '類別'],
			answer: []
		},
		{
			artistList: [{ artist_name: 'exist_artist_name', id: 10 }],
			groupByIndex: { trade_id: [['id', 'artist_name']] },
			dataHeader: ['收據號碼', '類別'],
			answer: [{ artist_name: 'artist_name' }]
		}
	])('GetNewArtistList $answer', ({ artistList, groupByIndex, dataHeader, answer }) => {
		const result = GetNewArtistList(artistList as ArtistRow[], groupByIndex, dataHeader);

		expect(result).toStrictEqual(answer);
	});
	it.each([
		{
			tradeIdList: [{ trade_id: '1' }],
			artistList: [{ artist_name: 'artist_name', id: 10 }],
			groupByIndex: {
				trade_id: [
					['trade_id', 'artist_name', 'item', '1', '1', '0', '1', '關閉', '2024-01-01 21:37']
				]
			},
			timezoneOffset: '+08:00',
			dataHeader: [
				'收據號碼',
				'類別',
				'商品',
				'數量',
				'銷售總額',
				'折扣',
				'淨銷售額',
				'狀態',
				'日期'
			],
			answer: {
				susTradeIdList: [],
				tradeBodyList: [
					{
						artist_id: 10,
						discount: 0,
						item_name: 'item',
						net_sales: 1,
						quantity: 1,
						total_sales: 1,
						trade_id: 'trade_id'
					}
				],
				tradeHeadList: [
					{
						trade_date: '2024-01-01T13:37:00.000Z',
						trade_id: 'trade_id'
					}
				]
			}
		},
		{
			tradeIdList: [{ trade_id: 'trade_id' }, { trade_id: 'exist_trade_id' }],
			artistList: [{ artist_name: 'artist_name', id: 10 }],
			groupByIndex: {
				trade_id: [],
				exist_trade_id: [
					['exist_trade_id', 'artist_name', 'item', '1', '1', '0', '1', '關閉', '2024-01-01 21:37']
				]
			},
			timezoneOffset: '+08:00',
			dataHeader: [
				'收據號碼',
				'類別',
				'商品',
				'數量',
				'銷售總額',
				'折扣',
				'淨銷售額',
				'狀態',
				'日期'
			],
			answer: {
				susTradeIdList: [],
				tradeBodyList: [],
				tradeHeadList: []
			}
		},
		{
			tradeIdList: [{ trade_id: 'trade_id' }, { trade_id: 'exist_trade_id' }],
			artistList: [{ artist_name: 'artist_name', id: 10 }],
			groupByIndex: {
				trade_id: [],
				exist_trade_id: [['exist_trade_id', 'artist_name', 'item', '1', '1']]
			},
			timezoneOffset: '+08:00',
			dataHeader: [
				'收據號碼',
				'類別',
				'商品',
				'數量',
				'銷售總額',
				'折扣',
				'淨銷售額',
				'狀態',
				'日期'
			],
			answer: {
				susTradeIdList: [],
				tradeBodyList: [],
				tradeHeadList: []
			}
		},
		{
			tradeIdList: [{ trade_id: '1' }],
			artistList: [{ artist_name: 'artist_name', id: 10 }],
			groupByIndex: {
				trade_id: [
					['trade_id', 'artist_name', 'item', '1', '1', '0', '1', 'not關閉', '2024-01-01 21:37']
				]
			},
			timezoneOffset: '+08:00',
			dataHeader: [
				'收據號碼',
				'類別',
				'商品',
				'數量',
				'銷售總額',
				'折扣',
				'淨銷售額',
				'狀態',
				'日期'
			],
			answer: {
				susTradeIdList: ['trade_id'],
				tradeBodyList: [],
				tradeHeadList: []
			}
		}
	])(
		'GetStoreData($groupByIndex)',
		({ tradeIdList, artistList, groupByIndex, timezoneOffset, dataHeader, answer }) => {
			const result = GetStoreData(
				tradeIdList,
				artistList as ArtistRow[],
				groupByIndex as Record<string, string[][]>,
				timezoneOffset,
				dataHeader
			);
			expect(result).toStrictEqual(answer);
		}
	);
	it('try input error file array', () => {
		const dataHeader: string[] = ['收據號碼', '類別', '商品', '數量'];
		const tradeIdList: { trade_id: string }[] = [];
		const artistList: ArtistRow[] = [];
		const groupByIndex: Record<string, string[][]> = {};
		const timezoneOffset: string = '';
		const { error } = GetStoreData(
			tradeIdList,
			artistList as ArtistRow[],
			groupByIndex as Record<string, string[][]>,
			timezoneOffset,
			dataHeader
		);
		expect(error).toStrictEqual('銷售總額,折扣,淨銷售額,日期, not found');
	});
	it('GetDateWithTimeZone', () => {
		expect(GetDateWithTimeZone('2024-01-01 21:37', '+08:00').toISOString()).eq(
			'2024-01-01T13:37:00.000Z'
		);
		expect(GetDateWithTimeZone('2024-03-10T09:43:00+00:00', '+08:00').toISOString()).eq(
			'2024-03-10T09:43:00.000Z'
		);
	});
});

describe('new importFunction', () => {
	const testTradeRow: ImportedTrade[] = [
		{
			artist_name: 'artist_random_id artist_name',

			item_name: 'item_name',
			quantity: 1,
			total_sales: 150,
			discount: 0,
			net_sales: 150,
			trade_date: '2024-07-08T15:03:00.000Z',
			trade_id: '2-1022',
			store_name: 'The shop2'
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
			store_name: 'The shop1'
		}
	];

	it('string to object but header is broken', async () => {
		// UTC+8 timezone test
		const context =
			'期,據號碼,收據類型,類別,SKU,商品,變體,修飾符已应用的,數量,銷售總額,折扣,淨銷售額,銷售成本,毛利潤,稅務,POS,商店,收銀員名稱,客戶名稱,客戶聯繫電話,註釋,狀態\n' +
			'2024-07-08 23:03+8,2-1022,銷售,artist_random_id artist_name,sku,item_name,,,1.000,150.00,0.00,150.00,0.00,150.00,0.00,POS 2,The shop2,,,,,關閉\n\n' +
			'2024-07-08 23:03,2-1022,銷售,artist_random_id artist_name,sku,item_name,,,1.000,150.00,0.00,150.00,0.00,150.00,0.00,POS 2,The shop1,,,,,關閉\n\n';

		const expectTradeRow: ImportedTrade[] = [];

		const file = new File([context], 'filename');
		const result = await fileToArray(file);
		const dataHeader = result.shift() ?? [];
		const body = result;
		const res = Array2DToImportedTrade(dataHeader, body);
		expect(res).toStrictEqual(expectTradeRow);
	});
	it('string to object', async () => {
		// UTC+8 timezone test
		const context =
			'日期,收據號碼,收據類型,類別,SKU,商品,變體,修飾符已应用的,數量,銷售總額,折扣,淨銷售額,銷售成本,毛利潤,稅務,POS,商店,收銀員名稱,客戶名稱,客戶聯繫電話,註釋,狀態\n' +
			'2024-07-08 23:03+8,2-1022,銷售,artist_random_id artist_name,sku,item_name,,,1.000,150.00,0.00,150.00,0.00,150.00,0.00,POS 2,The shop2,,,,,關閉\n\n' +
			'2024-07-08 23:03,2-1022,銷售,artist_random_id artist_name,sku,item_name,,,1.000,150.00,0.00,150.00,0.00,150.00,0.00,POS 2,The shop1,,,,,關閉\n\n';

		const file = new File([context], 'filename');
		const result = await fileToArray(file);
		const dataHeader = result.shift() ?? [];
		const body = result;
		const res = Array2DToImportedTrade(dataHeader, body);
		expect(res).toStrictEqual(testTradeRow);
	});
	it('get artist name set in imported trade', async () => {
		const artistSet = GetArtistNameSet(testTradeRow);
		expect(artistSet).toStrictEqual(new Set(['artist_random_id artist_name']));
	});
	it('get trade head in imported trade', () => {
		const tradeHeadList = GetTradeHeadSet(testTradeRow);

		expect(tradeHeadList).toStrictEqual(
			new Set([
				{
					trade_date: '2024-07-08T15:03:00.000Z',
					trade_id: '2-1022'
				}
			])
		);
	});
});
