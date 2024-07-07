import { expect, test } from 'vitest';
import { FormatDate, GetSeason, groupBy } from './Utils';
import { supabase, type TradeHead } from '$lib/db';

test.each([
	{ dateStr: '2024-01-01 19:00', answer: '2024/01/01' },
	{ dateStr: '2024-01-02Z01:00+08:00', answer: '2024/01/02' },
	{ dateStr: '2024-01-01Z19:00+08:00', answer: '2024/01/01' },
	{ dateStr: '2024-01-01T17:00:00.000Z', answer: '2024/01/02' },
	{ dateStr: '2024-01-01T10:00:00.000Z', answer: '2024/01/01' }
])('format date $dateStr', async ({ dateStr, answer }) => {
	const result = FormatDate(new Date(dateStr));
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
		const result = GetSeason(date);
		expect(result).toBe(expected);
	}
});

test('test get total with shop', async () => {
	let artist_id = 1;
	let start_date = '2024-01-01';
	let end_date = '2024-01-02';
	let data1, data2, data3;

	{
		const { data, error } = await supabase.rpc('get_total_trade', {
			artist_id,
			start_date,
			end_date
		});
		expect(error).toBe(null);
		data1 = data;
	}
	{
		const { data, error } = await supabase.rpc('get_total_trade_with_shop', {
			artist_id,
			start_date,
			end_date,
			shop_id: 1
		});
		expect(error).toBe(null);
		data2 = data;
	}
	{
		const { data, error } = await supabase.rpc('get_total_trade_with_shop', {
			artist_id,
			start_date,
			end_date,
			shop_id: 3
		});
		expect(error).toBe(null);
		data3 = data;
	}
	expect(data1).toBe(data3);
});
