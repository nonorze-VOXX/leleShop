import { expect, test } from 'vitest';
import { FormatDate, GetSeason, groupBy } from './Utils';

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

test.each([
	{
		year: 2024,
		month: 2,
		expected: 1
	},
	{
		year: 2024,
		month: 1,
		expected: 0
	},
	{
		year: 2025,
		month: 2,
		expected: 5
	},
	{
		year: 2025,
		month: 1,
		day: 1,
		expected: 4
	},
	{
		year: 2024,
		month: 7,
		expected: 2
	},
	{
		year: 2025,
		month: 7,
		expected: 6
	},
	{
		year: 2024,
		month: 12,
		expected: 4
	}
])('get season $year-$month', ({ expected, month, year }) => {
	{
		const date = new Date(year, month - 1);
		// expect(date.getMonth()).toBe(month);
		const result = GetSeason(date);
		expect(result).toBe(expected);
	}
});
