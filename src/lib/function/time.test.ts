import { expect, test } from 'vitest';

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
