import { describe, expect, test } from 'vitest';
import { DateStringToDate, FormatDate, GetFirstDayOfMonth, GetLastDayOfMonth } from './Utils';

test.each([
	{ dateStr: '2024-01-01 19:00', answer: '2024/01/01' }, // decide by timezone which device are running
	{ dateStr: '2024-01-02Z01:00+08:00', answer: '2024/01/02' },
	{ dateStr: '2024-01-01Z19:00+08:00', answer: '2024/01/01' },
	{ dateStr: '2024-01-01T17:00:00.000Z', answer: '2024/01/02' },
	{ dateStr: '2024-01-01T10:00:00.000Z', answer: '2024/01/01' }
])('format date $dateStr', ({ dateStr, answer }) => {
	const result = FormatDate(dateStr);
	expect(result).toBe(answer);
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

describe('Date function', () => {
	describe('GetFirstDayOfMonth', () => {
		test.each(['2024-12-01', '2024-12-31'])('2024-12-01', (d) => {
			const date = new Date(d);
			const result = GetFirstDayOfMonth(date);
			expect(result).toBe('2024-12-01');
		});
		test.each(['2024-11-01', '2024-11-30'])('2024-11-01', (d) => {
			const date = new Date(d);
			const result = GetFirstDayOfMonth(date);
			expect(result).toBe('2024-11-01');
		});
		test.each(['2025-01-01', '2025-01-30'])('2025-01-01', (d) => {
			const date = new Date(d);
			const result = GetFirstDayOfMonth(date);
			expect(result).toBe('2025-01-01');
		});
	});
	describe('GetLastDayOfMonth', () => {
		test.each(['2024-12-01', '2024-12-31'])('2024-12-31', (d) => {
			expect(GetLastDayOfMonth(new Date(d))).toBe('2024-12-31');
		});
		test.each(['2025-01-01', '2025-01-31'])('2025-01-31', (d) => {
			expect(GetLastDayOfMonth(new Date(d))).toBe('2025-01-31');
		});
	});
	test('GetFirstDayOfMonth and GetLastDayOfMonth format to Date', () => {
		const date1 = new Date('2024-12-01');
		const date2 = new Date(Number('2024'), Number('12') - 1, Number('01'));
		const date3 = new Date();
		// expect(process.env.TZ).toBe('UTC+8');
		expect(date3.getTimezoneOffset()).toEqual(-480); // -480
		expect(date2.getTimezoneOffset() / 60).toEqual(-8);
		expect(date2.getHours()).toEqual(0);
		expect(date2.getFullYear()).toEqual(2024);
		expect(date2.getMonth()).toEqual(11);
		expect(date2.getDate()).toEqual(1);
		expect(date1 === date2).toEqual(false);
	});
	test('DateStringToDate', () => {
		const dateStr = '2024-12-01';
		const result = DateStringToDate(dateStr);
		expect(result.getFullYear()).toEqual(2024);
		expect(result.getMonth()).toEqual(11);
		expect(result.getDate()).toEqual(1);
	});
});
