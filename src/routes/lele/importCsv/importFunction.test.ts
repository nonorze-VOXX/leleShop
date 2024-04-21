import { describe, it, expect } from 'vitest';
import { GetDateWithTimeZone, GetNewArtistList, GetStoreData, fileToArray } from './importFunction';
import type { ArtistRow } from '$lib/db';

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
						state: '關閉',
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
