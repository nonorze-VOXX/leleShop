import { expect, test } from 'vitest';
import { GetYearMonth, FormatDate, groupBy, payment_compare_year_month } from './Utils';
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

test.each([
	{ year_month1: '2025-06', year_month2: '2024-06', answer: 1 },
	{ year_month1: '2024-06', year_month2: '2024-06', answer: 0 },
	{ year_month1: '2024-07', year_month2: '2024-06', answer: 1 },
	{ year_month1: '2024-05', year_month2: '2024-06', answer: -1 }
])('test payment compare year month', ({ year_month1, year_month2, answer }) => {
	const data1: PaymentStatusRow = {
		artist_id: null,
		id: 0,
		process_state: 'todo',
		year_month: year_month1
	};
	const data2: PaymentStatusRow = {
		artist_id: null,
		id: 0,
		process_state: 'todo',
		year_month: year_month2
	};
	expect(payment_compare_year_month(data1, data2)).toBe(answer);
});

// test('tmp teset', () => {
// 	const today = new Date();
// 	expect(today.getMonth()).toBe(4);
// 	const yearmonth = GetYearMonth();
// 	expect(yearmonth).toBe('2024-05');
// });
