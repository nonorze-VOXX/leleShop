import { describe, it, expect } from 'vitest';
import { GetNewArtistList, fileToArray } from './importFunction';
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
		{ context: '\n1,2,3,4', answer: [[], ['1', '2', '3', '4']] },
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
});
