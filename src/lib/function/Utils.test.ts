import { expect, test } from 'vitest';
import { FormatDate, GetYearMonth, groupBy } from './Utils';
import type { PaymentStatusRow } from '$lib/db';

test.each([
	{ dateStr: '2024-01-01 19:00', answer: '2024/01/01' },
	{ dateStr: '2024-01-02Z01:00+08:00', answer: '2024/01/01' },
	{ dateStr: '2024-01-01Z19:00+08:00', answer: '2024/01/01' },
	{ dateStr: '2024-01-01T17:00:00.000Z', answer: '2024/01/01' },
	{ dateStr: '2024-01-01T10:00:00.000Z', answer: '2024/01/01' }
])('format date $dateStr', ({ dateStr, answer }) => {
	const result = FormatDate(dateStr);
	expect(result).toBe(answer);
});

test.each([
	{ input: [['test'], ['test']], output: { test: [['test'], ['test']] }, index: 0 },
	{
		input: [
			['t', 'a'],
			['t', 'b']
		],
		output: {
			t: [
				['t', 'a'],
				['t', 'b']
			]
		},
		index: 0
	},
	{
		input: [
			['t', 'a'],
			['t', 'b']
		],
		output: { a: [['t', 'a']], b: [['t', 'b']] },
		index: 1
	},
	{ input: [[undefined], ['test']], output: { test: [['test']] }, index: 0 }
])('groupBy', ({ input, output, index }) => {
	const processedInput = input.filter(
		(e) => e.filter((ee) => ee === undefined).length === 0
	) as string[][];
	const result = groupBy(processedInput, (i) => i[index]);
	expect(result).toStrictEqual(output);
});

test('test payment compare year month', () => {
	{
		let season = GetYearMonth(new Date(2024, 3, 1));
		expect(season).toBe('2024-05');
	}
	{
		let season = GetYearMonth(new Date(2024, 2, 1));
		expect(season).toBe('2024-02');
	}
	{
		let season = GetYearMonth(new Date(2024, 1, 1));
		expect(season).toBe('2024-02');
	}
	{
		let season = GetYearMonth(new Date(2024, 0, 1));
		expect(season).toBe('2024-02');
	}
});
