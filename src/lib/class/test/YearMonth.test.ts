import { describe, expect, it } from 'vitest';
import { YearMonth } from '../YearMonth';

describe('YearMonth', () => {
	it('should be able to create a YearMonth instance', () => {
		const yearMonth = new YearMonth('2022-01');
		expect(yearMonth.year).toBe(2022);
		expect(yearMonth.month).toBe(1);
	});
	it('should be able to create a YearMonth instance with two string arguments', () => {
		const yearMonth = new YearMonth('2022', '01');
		expect(yearMonth.year).toBe(2022);
		expect(yearMonth.month).toBe(1);
	});
	it('should be able to create a YearMonth instance with two number arguments', () => {
		const yearMonth = new YearMonth(2022, 1);
		expect(yearMonth.year).toBe(2022);
		expect(yearMonth.month).toBe(1);
	});
	it('should be able to get the first time point of the month', () => {
		const yearMonth = new YearMonth('2022-01');
		expect(yearMonth.getFirstTimePoint()).toEqual(new Date(2022, 0, 1));
	});
	it('should be able to get the last time point of the month', () => {
		const yearMonth = new YearMonth('2022-01');
		expect(yearMonth.getLastTimePoint()).toEqual(new Date(2022, 1, 1));
	});
});
