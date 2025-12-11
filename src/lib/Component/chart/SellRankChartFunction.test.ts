import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { aggregateDataByDate } from './SellRankChartFunction';
import type { ArtistWithTradeRow } from '$lib/db';

describe('aggregateDataByDate', () => {
	it('should correctly parse UTC time and convert to local date in UTC+8 timezone', () => {
		const trades: ArtistWithTradeRow[] = [
			{
				artist_id: 1,
				artist_name: 'Artist A',
				discount: 0,
				id: 1,
				item_name: 'Item 1',
				net_sales: 100,
				quantity: 1,
				store_name: 'Store 1',
				total_sales: 100,
				trade_date: '2025-01-01T00:00:00Z',
				trade_id: 'trade1'
			}
		];

		const result = aggregateDataByDate(trades);

		expect(result).toHaveLength(1);
		expect(result[0].date).toBe('2025-01-01');
		expect(result[0].net_sales).toBe(100);
	});

	it('should handle UTC time near day boundary correctly', () => {
		const trades: ArtistWithTradeRow[] = [
			{
				artist_id: 1,
				artist_name: 'Artist A',
				discount: 0,
				id: 1,
				item_name: 'Item 1',
				net_sales: 50,
				quantity: 1,
				store_name: 'Store 1',
				total_sales: 50,
				trade_date: '2025-01-01T15:59:59Z', // UTC 3:59:59 PM -> 2025-01-02 11:59:59 PM in UTC+8 (still same day)
				trade_id: 'trade1'
			},
			{
				artist_id: 1,
				artist_name: 'Artist A',
				discount: 0,
				id: 2,
				item_name: 'Item 1',
				net_sales: 50,
				quantity: 1,
				store_name: 'Store 1',
				total_sales: 50,
				trade_date: '2025-01-01T16:00:00Z', // UTC 4:00 PM -> 2025-01-02 12:00 AM in UTC+8 (next day)
				trade_id: 'trade2'
			}
		];

		const result = aggregateDataByDate(trades);

		expect(result).toHaveLength(2);
		expect(result[0].date).toBe('2025-01-01');
		expect(result[0].net_sales).toBe(50);
		expect(result[1].date).toBe('2025-01-02');
		expect(result[1].net_sales).toBe(50);
	});

	it('should aggregate multiple trades on the same date', () => {
		const trades: ArtistWithTradeRow[] = [
			{
				artist_id: 1,
				artist_name: 'Artist A',
				discount: 0,
				id: 1,
				item_name: 'Item 1',
				net_sales: 100,
				quantity: 5,
				store_name: 'Store 1',
				total_sales: 120,
				trade_date: '2025-01-01T08:00:00Z', // 2025-01-01 in UTC+8
				trade_id: 'trade1'
			},
			{
				artist_id: 1,
				artist_name: 'Artist A',
				discount: 10,
				id: 2,
				item_name: 'Item 2',
				net_sales: 200,
				quantity: 3,
				store_name: 'Store 1',
				total_sales: 220,
				trade_date: '2025-01-01T12:00:00Z', // Same day in UTC+8
				trade_id: 'trade2'
			},
			{
				artist_id: 1,
				artist_name: 'Artist A',
				discount: 5,
				id: 3,
				item_name: 'Item 3',
				net_sales: 150,
				quantity: 2,
				store_name: 'Store 1',
				total_sales: 160,
				trade_date: '2025-01-02T08:00:00Z', // Next day in UTC+8
				trade_id: 'trade3'
			}
		];

		const result = aggregateDataByDate(trades);

		expect(result).toHaveLength(2);
		expect(result[0].date).toBe('2025-01-01');
		expect(result[0].net_sales).toBe(300); // 100 + 200
		expect(result[0].quantity).toBe(8); // 5 + 3
		expect(result[1].date).toBe('2025-01-02');
		expect(result[1].net_sales).toBe(150);
		expect(result[1].quantity).toBe(2);
	});

	it('should handle trades with null values', () => {
		const trades: ArtistWithTradeRow[] = [
			{
				artist_id: 1,
				artist_name: 'Artist A',
				discount: null,
				id: 1,
				item_name: 'Item 1',
				net_sales: null,
				quantity: null,
				store_name: 'Store 1',
				total_sales: null,
				trade_date: '2025-01-01T08:00:00Z',
				trade_id: 'trade1'
			},
			{
				artist_id: 1,
				artist_name: 'Artist A',
				discount: 0,
				id: 2,
				item_name: 'Item 1',
				net_sales: 100,
				quantity: 1,
				store_name: 'Store 1',
				total_sales: 100,
				trade_date: '2025-01-01T08:00:00Z',
				trade_id: 'trade2'
			}
		];

		const result = aggregateDataByDate(trades);

		expect(result).toHaveLength(1);
		expect(result[0].net_sales).toBe(100);
		expect(result[0].quantity).toBe(1);
	});

	it('should ignore trades with null trade_date', () => {
		const trades: ArtistWithTradeRow[] = [
			{
				artist_id: 1,
				artist_name: 'Artist A',
				discount: 0,
				id: 1,
				item_name: 'Item 1',
				net_sales: 100,
				quantity: 1,
				store_name: 'Store 1',
				total_sales: 100,
				trade_date: null,
				trade_id: 'trade1'
			},
			{
				artist_id: 1,
				artist_name: 'Artist A',
				discount: 0,
				id: 2,
				item_name: 'Item 1',
				net_sales: 50,
				quantity: 1,
				store_name: 'Store 1',
				total_sales: 50,
				trade_date: '2025-01-01T08:00:00Z',
				trade_id: 'trade2'
			}
		];

		const result = aggregateDataByDate(trades);

		expect(result).toHaveLength(1);
		expect(result[0].net_sales).toBe(50);
	});

	it('should return empty array for empty input', () => {
		const trades: ArtistWithTradeRow[] = [];
		const result = aggregateDataByDate(trades);

		expect(result).toHaveLength(0);
	});

	it('should sort dates in ascending order', () => {
		const trades: ArtistWithTradeRow[] = [
			{
				artist_id: 1,
				artist_name: 'Artist A',
				discount: 0,
				id: 3,
				item_name: 'Item 1',
				net_sales: 100,
				quantity: 1,
				store_name: 'Store 1',
				total_sales: 100,
				trade_date: '2025-01-03T08:00:00Z',
				trade_id: 'trade3'
			},
			{
				artist_id: 1,
				artist_name: 'Artist A',
				discount: 0,
				id: 1,
				item_name: 'Item 1',
				net_sales: 100,
				quantity: 1,
				store_name: 'Store 1',
				total_sales: 100,
				trade_date: '2025-01-01T08:00:00Z',
				trade_id: 'trade1'
			},
			{
				artist_id: 1,
				artist_name: 'Artist A',
				discount: 0,
				id: 2,
				item_name: 'Item 1',
				net_sales: 100,
				quantity: 1,
				store_name: 'Store 1',
				total_sales: 100,
				trade_date: '2025-01-02T08:00:00Z',
				trade_id: 'trade2'
			}
		];

		const result = aggregateDataByDate(trades);

		expect(result).toHaveLength(3);
		expect(result[0].date).toBe('2025-01-01');
		expect(result[1].date).toBe('2025-01-02');
		expect(result[2].date).toBe('2025-01-03');
	});

	it('should handle UTC midnight edge case correctly in UTC+8', () => {
		// UTC 00:00:00 (midnight) = UTC+8 08:00:00 (same day)
		const trades: ArtistWithTradeRow[] = [
			{
				artist_id: 1,
				artist_name: 'Artist A',
				discount: 0,
				id: 1,
				item_name: 'Item 1',
				net_sales: 100,
				quantity: 1,
				store_name: 'Store 1',
				total_sales: 100,
				trade_date: '2025-01-01T00:00:00Z',
				trade_id: 'trade1'
			}
		];

		const result = aggregateDataByDate(trades);

		expect(result).toHaveLength(1);
		expect(result[0].date).toBe('2025-01-01');
	});

	it('should handle UTC 23:59:59 correctly in UTC+8 (next day)', () => {
		// UTC 23:59:59 = UTC+8 07:59:59 next day
		const trades: ArtistWithTradeRow[] = [
			{
				artist_id: 1,
				artist_name: 'Artist A',
				discount: 0,
				id: 1,
				item_name: 'Item 1',
				net_sales: 100,
				quantity: 1,
				store_name: 'Store 1',
				total_sales: 100,
				trade_date: '2025-01-01T23:59:59Z',
				trade_id: 'trade1'
			}
		];

		const result = aggregateDataByDate(trades);

		expect(result).toHaveLength(1);
		expect(result[0].date).toBe('2025-01-02');
	});

	it('should correctly parse ISO 8601 format with +00:00 timezone offset', () => {
		const trades: ArtistWithTradeRow[] = [
			{
				artist_id: 1,
				artist_name: 'Artist A',
				discount: 0,
				id: 1,
				item_name: 'Item 1',
				net_sales: 100,
				quantity: 1,
				store_name: 'Store 1',
				total_sales: 100,
				trade_date: '2024-12-22T16:55:00+00:00', // UTC 4:55 PM -> 2024-12-23 12:55 AM in UTC+8 (next day)
				trade_id: 'trade1'
			}
		];

		const result = aggregateDataByDate(trades);

		expect(result).toHaveLength(1);
		expect(result[0].date).toBe('2024-12-23');
		expect(result[0].net_sales).toBe(100);
	});

	it('should handle multiple trades with +00:00 timezone offset format on same date', () => {
		const trades: ArtistWithTradeRow[] = [
			{
				artist_id: 1,
				artist_name: 'Artist A',
				discount: 0,
				id: 1,
				item_name: 'Item 1',
				net_sales: 150,
				quantity: 2,
				store_name: 'Store 1',
				total_sales: 150,
				trade_date: '2024-12-22T10:00:00+00:00', // UTC 10:00 AM -> 2024-12-22 6:00 PM in UTC+8
				trade_id: 'trade1'
			},
			{
				artist_id: 1,
				artist_name: 'Artist A',
				discount: 0,
				id: 2,
				item_name: 'Item 2',
				net_sales: 200,
				quantity: 3,
				store_name: 'Store 1',
				total_sales: 200,
				trade_date: '2024-12-22T16:30:00+00:00', // UTC 4:30 PM -> 2024-12-23 11:30 PM in UTC+8
				trade_id: 'trade2'
			}
		];

		const result = aggregateDataByDate(trades);

		expect(result).toHaveLength(2);
		expect(result[0].date).toBe('2024-12-22');
		expect(result[0].net_sales).toBe(150);
		expect(result[0].quantity).toBe(2);
		expect(result[1].date).toBe('2024-12-23');
		expect(result[1].net_sales).toBe(200);
		expect(result[1].quantity).toBe(3);
	});

	it('should handle UTC+00:00 format at midnight boundary', () => {
		const trades: ArtistWithTradeRow[] = [
			{
				artist_id: 1,
				artist_name: 'Artist A',
				discount: 0,
				id: 1,
				item_name: 'Item 1',
				net_sales: 100,
				quantity: 1,
				store_name: 'Store 1',
				total_sales: 100,
				trade_date: '2024-12-22T00:00:00+00:00', // UTC midnight -> 2024-12-22 8:00 AM in UTC+8
				trade_id: 'trade1'
			}
		];

		const result = aggregateDataByDate(trades);

		expect(result).toHaveLength(1);
		expect(result[0].date).toBe('2024-12-22');
	});

	it('should handle mixed Z and +00:00 timezone formats in same batch', () => {
		const trades: ArtistWithTradeRow[] = [
			{
				artist_id: 1,
				artist_name: 'Artist A',
				discount: 0,
				id: 1,
				item_name: 'Item 1',
				net_sales: 100,
				quantity: 1,
				store_name: 'Store 1',
				total_sales: 100,
				trade_date: '2024-12-22T08:00:00Z', // Z format (same as +00:00)
				trade_id: 'trade1'
			},
			{
				artist_id: 1,
				artist_name: 'Artist A',
				discount: 0,
				id: 2,
				item_name: 'Item 2',
				net_sales: 100,
				quantity: 1,
				store_name: 'Store 1',
				total_sales: 100,
				trade_date: '2024-12-22T08:00:00+00:00', // +00:00 format
				trade_id: 'trade2'
			}
		];

		const result = aggregateDataByDate(trades);

		expect(result).toHaveLength(1);
		expect(result[0].date).toBe('2024-12-22');
		expect(result[0].net_sales).toBe(200); // Both should aggregate to same date
		expect(result[0].quantity).toBe(2);
	});
});
