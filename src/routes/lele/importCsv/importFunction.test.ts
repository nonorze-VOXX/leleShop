import { describe, it, expect } from 'vitest';
import { fileToArray } from './importFunction';

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
	])('fileToArray($context) -> $answer', async ({ context, answer }) => {
		const file = new File([context], 'filename');

		const result = await fileToArray(file);
		expect(result).toStrictEqual(answer);
	});
});
