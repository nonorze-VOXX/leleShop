import { expect, test } from 'vitest';
import { GetDateWithTimeZone, timeZoneOffsetToHHMM } from '../../routes/lele/import/importFunction';

test('test date 0 or cross year', () => {
	for (let i = 0; i < 12; i++) {
		let date = new Date(2024, i, 1);
		expect(date.getFullYear()).toBe(2024);
		expect(date.getMonth()).toBe(i);
	}

	{
		let date = new Date(2024, 12, 1);
		expect(date.getFullYear()).toBe(2025);
		expect(date.getMonth()).toBe(0);
	}
	{
		let date = new Date(2024, 12, 0);
		expect(date.getFullYear()).toBe(2024);
		expect(date.getMonth()).toBe(11);
		expect(date.getDate()).toBe(31);
	}
});

test('format from lele', () => {
	{
		let date = new Date('2024-05-31 21:51+08');
		expect(date.getFullYear()).toBe(2024);
		expect(date.getMonth()).toBe(4);
		expect(date.getDate()).toBe(31);
		expect(date.getHours()).toBe(21);
		expect(date.toISOString()).toBe('2024-05-31T13:51:00.000Z');
	}
	{
		let timezoneOffset = new Date().getTimezoneOffset();
		let HHMM = timeZoneOffsetToHHMM(timezoneOffset);
		expect(HHMM).toBe('+08:00');
		let date = GetDateWithTimeZone('2024-05-31 21:51', HHMM);
		expect(date.getFullYear()).toBe(2024);
		expect(date.getMonth()).toBe(4);
		expect(date.getDate()).toBe(31);
		expect(date.getHours()).toBe(21);
		expect(date.toISOString()).toBe('2024-05-31T13:51:00.000Z');
	}
});
