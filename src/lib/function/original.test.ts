import { expect, test } from 'vitest';

async function isPositive(n: number) {
	return n > 0;
}
test('test filter', async () => {
	const arr = [1, 2, -1, 4];
	const result = await Promise.all(arr.map(async (n) => await isPositive(n)));
	expect(result).toEqual([true, true, false, true]);
	const result1 = (await Promise.all(arr.map(async (n) => await isPositive(n)))).filter((b) => b);
	expect(result1).toEqual([true, true, true]);
});
