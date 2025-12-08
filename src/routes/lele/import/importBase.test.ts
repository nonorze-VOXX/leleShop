import {
	artistIndex,
	itemNameIndex,
	quantityIndex,
	tradeIdIndex,
	totalIndex,
	discountIndex,
	netIndex,
	stateIndex,
	dateIndex,
	storeIndex,
	GetStoreId,
	GetStoreSet,
	GetTradeHeadSet,
	fileToArray,
	StringToArray,
	GetIndexByHeader,
	filterNonExistentArtists,
	GetArtistNameList
} from './importBase';
import { describe, it, expect } from 'vitest';
import type { ImportedTrade } from './importDTO';

describe('importBase', () => {
	const dataHeader = [
		'類別',
		'商品',
		'數量',
		'收據號碼',
		'銷售總額',
		'折扣',
		'淨銷售額',
		'狀態',
		'日期',
		'商店'
	];
	const storeData = [
		{ id: 1, store_name: 'Store1' },
		{ id: 2, store_name: 'Store2' }
	];
	const importedTrade: ImportedTrade[] = [
		{
			trade_id: '1',
			trade_date: '2023-01-01',
			store_name: 'Store1',
			artist_name: 'Artist1',
			discount: 1,
			item_name: '',
			net_sales: 1,
			quantity: 1,
			total_sales: 1
		},
		{
			trade_id: '2',
			trade_date: '2023-01-02',
			store_name: 'Store2',
			artist_name: 'Artist2',
			discount: 1,
			item_name: '',
			net_sales: 1,
			quantity: 1,
			total_sales: 1
		}
	];

	it('should find the correct index for headers', () => {
		expect(artistIndex(dataHeader)).toBe(0);
		expect(itemNameIndex(dataHeader)).toBe(1);
		expect(quantityIndex(dataHeader)).toBe(2);
		expect(tradeIdIndex(dataHeader)).toBe(3);
		expect(totalIndex(dataHeader)).toBe(4);
		expect(discountIndex(dataHeader)).toBe(5);
		expect(netIndex(dataHeader)).toBe(6);
		expect(stateIndex(dataHeader)).toBe(7);
		expect(dateIndex(dataHeader)).toBe(8);
		expect(storeIndex(dataHeader)).toBe(9);
	});

	it('should get the correct store id', () => {
		expect(GetStoreId('Store1', storeData)).toBe(1);
		expect(GetStoreId('Store2', storeData)).toBe(2);
		expect(() => GetStoreId('Store3', storeData)).toThrow('store not found');
	});

	it('should get the correct store set', () => {
		const storeSet = GetStoreSet(importedTrade);
		expect(storeSet.has('Store1')).toBe(true);
		expect(storeSet.has('Store2')).toBe(true);
		expect(storeSet.size).toBe(2);
	});

	it('should get the correct trade head set', () => {
		const tradeHeadSet = GetTradeHeadSet(importedTrade, storeData);
		expect(tradeHeadSet.size).toBe(2);
	});

	it('should convert file to array', async () => {
		const file = new File(['a,b,c\n1,2,3'], 'test.csv', { type: 'text/csv' });
		const array = await fileToArray(file);
		expect(array).toEqual([
			['a', 'b', 'c'],
			['1', '2', '3']
		]);
	});
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

	it('should convert string to array', async () => {
		const text = 'a,b,c\n1,2,3';
		const array = await StringToArray(text);
		expect(array).toEqual([
			['a', 'b', 'c'],
			['1', '2', '3']
		]);
	});

	it('should get the correct index by header', () => {
		const index = GetIndexByHeader(dataHeader);
		expect(index).toEqual({
			tradeIdIdx: 3,
			artistIdx: 0,
			itemNameIdx: 1,
			quantityIdx: 2,
			totalIdx: 4,
			discountIdx: 5,
			netIdx: 6,
			dateIdx: 8,
			storeIdx: 9,
			stateIdx: 7
		});
	});
});

describe('filterNonExistentArtists', () => {
	const importedTrade: { artist_name: string }[] = [
		{
			artist_name: 'Artist1'
		},
		{
			artist_name: 'Artist2'
		}
	];
	const exist_artist = [{ artist_name: 'Artist1', id: 1, report_key: null, visible: true }];

	it('should filter out non-existent artists', async () => {
		const result = await filterNonExistentArtists(importedTrade, exist_artist);
		expect(result).toEqual([{ artist_name: 'Artist2' }]);
	});
});

describe('GetArtistNameList', () => {
	const artist_name = ['Artist1', 'Artist2', 'Artist1'];
	const importedTrade: { artist_name: string }[] = artist_name.map((artist_name) => ({
		artist_name
	}));

	it('should get the correct artist name list', () => {
		const artistNameList = GetArtistNameList(importedTrade);
		expect(artistNameList).toEqual(['Artist1', 'Artist2']);
	});
});
