import { expect, test } from 'vitest';
import { FormatDate, groupBy } from './Utils';

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

function testFunction(
	{
		head,
		count
	}: {
		head?: boolean;
		count?: 'exact' | 'planned' | 'estimated';
	} = { head: false }
) {
	return { head, count };
}

test('function option param test', () => {
	{
		const { count, head } = testFunction({ head: true });
		expect(count).toBe(undefined);
		expect(head).toBe(true);
	}
	{
		const { count, head } = testFunction();
		expect(count).toBe(undefined);
		expect(head).toBe(false);
	}
	{
		const { count, head } = testFunction({ count: 'exact' });
		expect(count).toBe('exact');
		expect(head).toBe(undefined);
	}
});

test('js ? check', () => {
	{
		const un = undefined;
		const result = un ?? true;
		expect(result).toBe(true);
	}
	{
		const un = false;
		const result = un ?? true;
		expect(result).toBe(false);
	}
	{
		const un = null;
		const result = un ?? true;
		expect(result).toBe(true);
	}
});

test('tmp', async () => {
	// const { data, count, csv } = await DbArtistTrade.GetTradeFullData({
	// 	id: 1,
	// 	csv: true
	// });
	// expect(count).toBeDefined();
	// expect(data).toBe(null);
	// expect(csv?.split('\n').at(0)).toBe('');
});
