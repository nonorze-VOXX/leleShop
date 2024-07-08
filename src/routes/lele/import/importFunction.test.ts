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
	it('GetDateWithTimeZone', () => {
		expect(GetDateWithTimeZone('2024-01-01 21:37', '+08:00').toISOString()).eq(
			'2024-01-01T13:37:00.000Z'
		);
		expect(GetDateWithTimeZone('2024-03-10T09:43:00+00:00', '+08:00').toISOString()).eq(
			'2024-03-10T09:43:00.000Z'
		);
	});
});
