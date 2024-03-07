import { expect, test } from 'vitest';
import { FormatDate } from './Utils';

test.each([
	{ dateStr: '2024-01-01 19:00', answer: '2024/01/01' },
	{ dateStr: '2024-01-01Z19:00+08:00', answer: '2024/01/01' }
])('format date $dateStr', ({ dateStr, answer }) => {
	const result = FormatDate(dateStr);
	expect(result).toBe(answer);
});
